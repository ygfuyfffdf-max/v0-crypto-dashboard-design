'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔔 CHRONOS INFINITY 2026 — SERVER ACTIONS: NOTIFICACIONES Y APROBACIONES
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Acciones para el sistema de notificaciones push y aprobaciones:
 * - Crear y enviar notificaciones
 * - Gestionar cola de aprobaciones
 * - Marcar como leídas
 * - Estadísticas de notificaciones
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { nanoid } from 'nanoid'
import { logger } from '@/app/lib/utils/logger'
import { registrarAuditoria } from './auditoria'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TipoNotificacion = 'info' | 'warning' | 'error' | 'success' | 'aprobacion' | 'alerta' | 'sistema'
export type Prioridad = 'baja' | 'normal' | 'alta' | 'urgente'
export type EstadoAprobacion = 'pendiente' | 'aprobada' | 'rechazada' | 'expirada' | 'cancelada'

export interface Notificacion {
  id: string
  usuarioId: string
  rolId?: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  icono?: string
  color?: string
  actionUrl?: string
  actionLabel?: string
  modulo?: string
  entidadTipo?: string
  entidadId?: string
  prioridad: Prioridad
  leida: boolean
  leidaAt?: Date
  descartada: boolean
  expiraAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface AprobacionPendiente {
  id: string
  solicitanteId: string
  solicitanteNombre: string
  aprobadorRolId?: string
  aprobadorUsuarioId?: string
  modulo: string
  accion: string
  entidadTipo: string
  entidadId?: string
  datosOperacion: Record<string, unknown>
  bancoId?: string
  bancoNombre?: string
  monto?: number
  motivo?: string
  observaciones?: string
  estado: EstadoAprobacion
  resueltoPor?: string
  resueltoNombre?: string
  fechaResolucion?: Date
  motivoRechazo?: string
  expiraAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface CreateNotificacionInput {
  usuarioId: string
  rolId?: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  icono?: string
  color?: string
  actionUrl?: string
  actionLabel?: string
  modulo?: string
  entidadTipo?: string
  entidadId?: string
  prioridad?: Prioridad
  expiraAt?: Date
  metadata?: Record<string, unknown>
}

export interface CreateAprobacionInput {
  solicitanteId: string
  solicitanteNombre: string
  aprobadorRolId?: string
  aprobadorUsuarioId?: string
  modulo: string
  accion: string
  entidadTipo: string
  entidadId?: string
  datosOperacion: Record<string, unknown>
  bancoId?: string
  bancoNombre?: string
  monto?: number
  motivo?: string
  observaciones?: string
  expiraEnHoras?: number
  metadata?: Record<string, unknown>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ESTADO EN MEMORIA (En producción, usar BD)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

let notificacionesState: Notificacion[] = [
  {
    id: '1',
    usuarioId: 'user1',
    tipo: 'aprobacion',
    titulo: 'Aprobación Requerida',
    mensaje: 'Se requiere aprobación para un gasto de $75,000 en Leftie',
    icono: 'alert-triangle',
    color: 'amber',
    actionUrl: '/configuracion/aprobaciones',
    actionLabel: 'Revisar',
    modulo: 'bancos',
    prioridad: 'alta',
    leida: false,
    descartada: false,
    createdAt: new Date(),
  },
  {
    id: '2',
    usuarioId: 'user1',
    tipo: 'success',
    titulo: 'Transferencia Completada',
    mensaje: 'Se transfirieron $50,000 de Bóveda Monte a Profit',
    icono: 'check-circle',
    color: 'emerald',
    modulo: 'bancos',
    prioridad: 'normal',
    leida: false,
    descartada: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    usuarioId: 'user1',
    tipo: 'warning',
    titulo: 'Límite Diario Alcanzando',
    mensaje: 'Has utilizado el 85% de tu límite diario en operaciones',
    icono: 'alert-circle',
    color: 'amber',
    prioridad: 'alta',
    leida: true,
    leidaAt: new Date(),
    descartada: false,
    createdAt: new Date(Date.now() - 7200000),
  },
]

let aprobacionesState: AprobacionPendiente[] = [
  {
    id: 'ap1',
    solicitanteId: 'user2',
    solicitanteNombre: 'Operador 1',
    aprobadorRolId: 'admin_supremo',
    modulo: 'bancos',
    accion: 'gasto',
    entidadTipo: 'movimiento',
    datosOperacion: {
      tipo: 'gasto',
      monto: 75000,
      concepto: 'Pago a proveedor de emergencia',
      categoria: 'gastos_operativos',
    },
    bancoId: 'leftie',
    bancoNombre: 'Leftie',
    monto: 75000,
    motivo: 'Pago urgente a proveedor por reparación de equipos',
    estado: 'pendiente',
    expiraAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
  {
    id: 'ap2',
    solicitanteId: 'user3',
    solicitanteNombre: 'Cajero Profit',
    aprobadorRolId: 'operador_general',
    modulo: 'bancos',
    accion: 'transferir',
    entidadTipo: 'transferencia',
    datosOperacion: {
      tipo: 'transferencia',
      monto: 100000,
      bancoOrigen: 'profit',
      bancoDestino: 'boveda_monte',
    },
    bancoId: 'profit',
    bancoNombre: 'Profit',
    monto: 100000,
    motivo: 'Consolidación de fondos para cierre de mes',
    estado: 'pendiente',
    expiraAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3600000),
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Crear y enviar una notificación
 */
export async function crearNotificacion(
  input: CreateNotificacionInput
): Promise<{ success: boolean; data?: Notificacion; error?: string }> {
  try {
    const id = nanoid()
    const notificacion: Notificacion = {
      id,
      ...input,
      prioridad: input.prioridad || 'normal',
      leida: false,
      descartada: false,
      createdAt: new Date(),
    }
    
    notificacionesState.unshift(notificacion)
    
    logger.info('Notificación creada', {
      context: 'Notificaciones',
      data: { id, usuarioId: input.usuarioId, tipo: input.tipo, titulo: input.titulo },
    })
    
    return { success: true, data: notificacion }
  } catch (error) {
    logger.error('Error al crear notificación', error, { context: 'crearNotificacion' })
    return { success: false, error: 'Error al crear notificación' }
  }
}

/**
 * Obtener notificaciones de un usuario
 */
export async function getNotificaciones(
  usuarioId: string,
  options: { soloNoLeidas?: boolean; tipo?: TipoNotificacion; limit?: number } = {}
): Promise<{ success: boolean; data?: Notificacion[]; total?: number; noLeidas?: number; error?: string }> {
  try {
    let result = notificacionesState.filter(n => 
      n.usuarioId === usuarioId && !n.descartada
    )
    
    if (options.soloNoLeidas) {
      result = result.filter(n => !n.leida)
    }
    
    if (options.tipo) {
      result = result.filter(n => n.tipo === options.tipo)
    }
    
    const noLeidas = notificacionesState.filter(n => 
      n.usuarioId === usuarioId && !n.leida && !n.descartada
    ).length
    
    if (options.limit) {
      result = result.slice(0, options.limit)
    }
    
    return { 
      success: true, 
      data: result, 
      total: result.length,
      noLeidas,
    }
  } catch (error) {
    logger.error('Error al obtener notificaciones', error, { context: 'getNotificaciones', usuarioId })
    return { success: false, error: 'Error al obtener notificaciones' }
  }
}

/**
 * Marcar notificación como leída
 */
export async function marcarComoLeida(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const index = notificacionesState.findIndex(n => n.id === id)
    if (index === -1) {
      return { success: false, error: 'Notificación no encontrada' }
    }
    
    notificacionesState[index] = {
      ...notificacionesState[index],
      leida: true,
      leidaAt: new Date(),
    }
    
    return { success: true }
  } catch (error) {
    logger.error('Error al marcar como leída', error, { context: 'marcarComoLeida', id })
    return { success: false, error: 'Error al actualizar' }
  }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function marcarTodasComoLeidas(
  usuarioId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    notificacionesState = notificacionesState.map(n => {
      if (n.usuarioId === usuarioId && !n.leida) {
        return { ...n, leida: true, leidaAt: new Date() }
      }
      return n
    })
    
    return { success: true }
  } catch (error) {
    logger.error('Error al marcar todas como leídas', error, { context: 'marcarTodasComoLeidas' })
    return { success: false, error: 'Error al actualizar' }
  }
}

/**
 * Descartar notificación
 */
export async function descartarNotificacion(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const index = notificacionesState.findIndex(n => n.id === id)
    if (index === -1) {
      return { success: false, error: 'Notificación no encontrada' }
    }
    
    notificacionesState[index] = {
      ...notificacionesState[index],
      descartada: true,
    }
    
    return { success: true }
  } catch (error) {
    logger.error('Error al descartar', error, { context: 'descartarNotificacion', id })
    return { success: false, error: 'Error al descartar' }
  }
}

/**
 * Limpiar notificaciones antiguas
 */
export async function limpiarNotificacionesAntiguas(
  usuarioId: string,
  diasAntiguedad = 30
): Promise<{ success: boolean; eliminadas?: number; error?: string }> {
  try {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad)
    
    const antes = notificacionesState.length
    notificacionesState = notificacionesState.filter(n => 
      n.usuarioId !== usuarioId || n.createdAt > fechaLimite
    )
    const eliminadas = antes - notificacionesState.length
    
    return { success: true, eliminadas }
  } catch (error) {
    logger.error('Error al limpiar', error, { context: 'limpiarNotificacionesAntiguas' })
    return { success: false, error: 'Error al limpiar' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// APROBACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Crear una solicitud de aprobación
 */
export async function crearAprobacion(
  input: CreateAprobacionInput
): Promise<{ success: boolean; data?: AprobacionPendiente; error?: string }> {
  try {
    const id = nanoid()
    const expiraAt = input.expiraEnHoras 
      ? new Date(Date.now() + input.expiraEnHoras * 60 * 60 * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas por defecto
    
    const aprobacion: AprobacionPendiente = {
      id,
      ...input,
      estado: 'pendiente',
      expiraAt,
      createdAt: new Date(),
    }
    
    aprobacionesState.unshift(aprobacion)
    
    // Crear notificación para aprobadores
    if (input.aprobadorRolId || input.aprobadorUsuarioId) {
      await crearNotificacion({
        usuarioId: input.aprobadorUsuarioId || 'all_admins', // En producción, enviar a todos con el rol
        tipo: 'aprobacion',
        titulo: 'Nueva Aprobación Pendiente',
        mensaje: `${input.solicitanteNombre} solicita aprobación para ${input.accion} en ${input.modulo}${input.monto ? ` por $${input.monto.toLocaleString()}` : ''}`,
        icono: 'alert-triangle',
        color: 'amber',
        actionUrl: '/configuracion/aprobaciones',
        actionLabel: 'Revisar',
        modulo: input.modulo,
        entidadTipo: input.entidadTipo,
        entidadId: id,
        prioridad: 'alta',
      })
    }
    
    logger.info('Solicitud de aprobación creada', {
      context: 'Aprobaciones',
      data: { id, solicitante: input.solicitanteNombre, modulo: input.modulo, monto: input.monto },
    })
    
    return { success: true, data: aprobacion }
  } catch (error) {
    logger.error('Error al crear aprobación', error, { context: 'crearAprobacion' })
    return { success: false, error: 'Error al crear solicitud' }
  }
}

/**
 * Obtener aprobaciones pendientes (para un aprobador)
 */
export async function getAprobacionesPendientes(
  usuarioId: string,
  rolId?: string
): Promise<{ success: boolean; data?: AprobacionPendiente[]; total?: number; error?: string }> {
  try {
    const result = aprobacionesState.filter(a => 
      a.estado === 'pendiente' &&
      (a.aprobadorUsuarioId === usuarioId || 
       a.aprobadorRolId === rolId ||
       !a.aprobadorUsuarioId && !a.aprobadorRolId) // Si no tiene aprobador específico
    )
    
    return { success: true, data: result, total: result.length }
  } catch (error) {
    logger.error('Error al obtener aprobaciones', error, { context: 'getAprobacionesPendientes' })
    return { success: false, error: 'Error al obtener solicitudes' }
  }
}

/**
 * Obtener historial de aprobaciones (enviadas por un usuario)
 */
export async function getMisAprobaciones(
  usuarioId: string,
  options: { estado?: EstadoAprobacion; limit?: number } = {}
): Promise<{ success: boolean; data?: AprobacionPendiente[]; error?: string }> {
  try {
    let result = aprobacionesState.filter(a => a.solicitanteId === usuarioId)
    
    if (options.estado) {
      result = result.filter(a => a.estado === options.estado)
    }
    
    if (options.limit) {
      result = result.slice(0, options.limit)
    }
    
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener mis aprobaciones', error, { context: 'getMisAprobaciones' })
    return { success: false, error: 'Error al obtener solicitudes' }
  }
}

/**
 * Aprobar una solicitud
 */
export async function aprobarSolicitud(
  id: string,
  aprobadorId: string,
  aprobadorNombre: string,
  observaciones?: string
): Promise<{ success: boolean; data?: AprobacionPendiente; error?: string }> {
  try {
    const index = aprobacionesState.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, error: 'Solicitud no encontrada' }
    }
    
    const aprobacion = aprobacionesState[index]
    
    if (aprobacion.estado !== 'pendiente') {
      return { success: false, error: 'Esta solicitud ya fue procesada' }
    }
    
    const actualizada: AprobacionPendiente = {
      ...aprobacion,
      estado: 'aprobada',
      resueltoPor: aprobadorId,
      resueltoNombre: aprobadorNombre,
      fechaResolucion: new Date(),
      metadata: { ...aprobacion.metadata, observacionesAprobador: observaciones },
    }
    
    aprobacionesState[index] = actualizada
    
    // Notificar al solicitante
    await crearNotificacion({
      usuarioId: aprobacion.solicitanteId,
      tipo: 'success',
      titulo: 'Solicitud Aprobada',
      mensaje: `Tu solicitud de ${aprobacion.accion} ha sido aprobada por ${aprobadorNombre}`,
      icono: 'check-circle',
      color: 'emerald',
      modulo: aprobacion.modulo,
      prioridad: 'normal',
    })
    
    // Registrar auditoría
    await registrarAuditoria({
      usuarioId: aprobadorId,
      usuarioNombre: aprobadorNombre,
      accion: 'aprobar',
      modulo: aprobacion.modulo as any,
      entidadTipo: 'aprobacion',
      entidadId: id,
      descripcion: `Aprobó solicitud de ${aprobacion.solicitanteNombre}: ${aprobacion.accion} en ${aprobacion.modulo}`,
      bancoId: aprobacion.bancoId,
      bancoNombre: aprobacion.bancoNombre,
      monto: aprobacion.monto,
      exitoso: true,
    })
    
    return { success: true, data: actualizada }
  } catch (error) {
    logger.error('Error al aprobar', error, { context: 'aprobarSolicitud', id })
    return { success: false, error: 'Error al aprobar solicitud' }
  }
}

/**
 * Rechazar una solicitud
 */
export async function rechazarSolicitud(
  id: string,
  aprobadorId: string,
  aprobadorNombre: string,
  motivoRechazo: string
): Promise<{ success: boolean; data?: AprobacionPendiente; error?: string }> {
  try {
    const index = aprobacionesState.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, error: 'Solicitud no encontrada' }
    }
    
    const aprobacion = aprobacionesState[index]
    
    if (aprobacion.estado !== 'pendiente') {
      return { success: false, error: 'Esta solicitud ya fue procesada' }
    }
    
    const actualizada: AprobacionPendiente = {
      ...aprobacion,
      estado: 'rechazada',
      resueltoPor: aprobadorId,
      resueltoNombre: aprobadorNombre,
      fechaResolucion: new Date(),
      motivoRechazo,
    }
    
    aprobacionesState[index] = actualizada
    
    // Notificar al solicitante
    await crearNotificacion({
      usuarioId: aprobacion.solicitanteId,
      tipo: 'error',
      titulo: 'Solicitud Rechazada',
      mensaje: `Tu solicitud de ${aprobacion.accion} fue rechazada: ${motivoRechazo}`,
      icono: 'x-circle',
      color: 'rose',
      modulo: aprobacion.modulo,
      prioridad: 'alta',
    })
    
    // Registrar auditoría
    await registrarAuditoria({
      usuarioId: aprobadorId,
      usuarioNombre: aprobadorNombre,
      accion: 'rechazar',
      modulo: aprobacion.modulo as any,
      entidadTipo: 'aprobacion',
      entidadId: id,
      descripcion: `Rechazó solicitud de ${aprobacion.solicitanteNombre}: ${motivoRechazo}`,
      bancoId: aprobacion.bancoId,
      bancoNombre: aprobacion.bancoNombre,
      monto: aprobacion.monto,
      exitoso: true,
    })
    
    return { success: true, data: actualizada }
  } catch (error) {
    logger.error('Error al rechazar', error, { context: 'rechazarSolicitud', id })
    return { success: false, error: 'Error al rechazar solicitud' }
  }
}

/**
 * Cancelar una solicitud propia
 */
export async function cancelarSolicitud(
  id: string,
  usuarioId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const index = aprobacionesState.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, error: 'Solicitud no encontrada' }
    }
    
    const aprobacion = aprobacionesState[index]
    
    if (aprobacion.solicitanteId !== usuarioId) {
      return { success: false, error: 'Solo el solicitante puede cancelar' }
    }
    
    if (aprobacion.estado !== 'pendiente') {
      return { success: false, error: 'Esta solicitud ya fue procesada' }
    }
    
    aprobacionesState[index] = {
      ...aprobacion,
      estado: 'cancelada',
      fechaResolucion: new Date(),
    }
    
    return { success: true }
  } catch (error) {
    logger.error('Error al cancelar', error, { context: 'cancelarSolicitud', id })
    return { success: false, error: 'Error al cancelar solicitud' }
  }
}

/**
 * Obtener estadísticas de aprobaciones
 */
export async function getAprobacionesStats(): Promise<{
  success: boolean
  data?: {
    pendientes: number
    aprobadas: number
    rechazadas: number
    expiradas: number
    porModulo: Record<string, number>
    tiempoPromedioResolucion: number
  }
  error?: string
}> {
  try {
    const stats = {
      pendientes: aprobacionesState.filter(a => a.estado === 'pendiente').length,
      aprobadas: aprobacionesState.filter(a => a.estado === 'aprobada').length,
      rechazadas: aprobacionesState.filter(a => a.estado === 'rechazada').length,
      expiradas: aprobacionesState.filter(a => a.estado === 'expirada').length,
      porModulo: {} as Record<string, number>,
      tiempoPromedioResolucion: 2.5, // horas (mock)
    }
    
    aprobacionesState.forEach(a => {
      stats.porModulo[a.modulo] = (stats.porModulo[a.modulo] || 0) + 1
    })
    
    return { success: true, data: stats }
  } catch (error) {
    logger.error('Error al obtener stats', error, { context: 'getAprobacionesStats' })
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}
