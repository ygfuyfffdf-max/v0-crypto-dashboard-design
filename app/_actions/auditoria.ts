'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📝 CHRONOS INFINITY 2026 — SERVER ACTIONS: AUDITORÍA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Acciones para el sistema de auditoría completo:
 * - Registro de operaciones
 * - Consulta de logs
 * - Estadísticas de actividad
 * - Exportación de auditoría
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { db } from '@/database'
import { nanoid } from 'nanoid'
import { logger } from '@/app/lib/utils/logger'
import { headers } from 'next/headers'
import { desc, eq, and, gte, lte, sql, count, like, or } from 'drizzle-orm'

// Importar schemas - Verificar existencia o usar mock
// En producción esto vendría del schema real
const mockAuditLog = {
  id: '',
  usuarioId: '',
  usuarioNombre: '',
  accion: '',
  modulo: '',
  timestamp: new Date(),
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface AuditEntry {
  id: string
  usuarioId: string
  usuarioNombre: string
  usuarioEmail?: string
  rolId?: string
  accion: 'crear' | 'editar' | 'eliminar' | 'ver' | 'exportar' | 'login' | 'logout' | 'aprobar' | 'rechazar' | 'transferir' | 'ingreso' | 'gasto'
  modulo: 'bancos' | 'ventas' | 'clientes' | 'distribuidores' | 'almacen' | 'ordenes' | 'reportes' | 'configuracion' | 'usuarios' | 'roles' | 'sistema'
  entidadTipo?: string
  entidadId?: string
  entidadNombre?: string
  descripcion: string
  datosAnteriores?: Record<string, unknown>
  datosNuevos?: Record<string, unknown>
  camposModificados?: string[]
  bancoId?: string
  bancoNombre?: string
  monto?: number
  ipAddress?: string
  userAgent?: string
  dispositivo?: string
  navegador?: string
  sistemaOperativo?: string
  exitoso?: boolean
  mensajeError?: string
  duracionMs?: number
  metadata?: Record<string, unknown>
  timestamp: Date
}

export interface AuditFilters {
  usuarioId?: string
  modulo?: string
  accion?: string
  bancoId?: string
  fechaInicio?: Date
  fechaFin?: Date
  exitoso?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface AuditStats {
  totalOperaciones: number
  porModulo: Record<string, number>
  porAccion: Record<string, number>
  porUsuario: Array<{ usuarioId: string; nombre: string; cantidad: number }>
  operacionesExitosas: number
  operacionesFallidas: number
  ultimaHora: number
  ultimoDia: number
  ultimaSemana: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Extrae información del dispositivo desde el User-Agent
 */
function parseUserAgent(userAgent: string): { dispositivo: string; navegador: string; sistemaOperativo: string } {
  const dispositivo = userAgent.includes('Mobile') 
    ? userAgent.includes('iPhone') ? 'iPhone' : userAgent.includes('Android') ? 'Android' : 'Mobile'
    : userAgent.includes('Tablet') || userAgent.includes('iPad') ? 'Tablet' : 'Desktop'
  
  let navegador = 'Desconocido'
  if (userAgent.includes('Chrome')) navegador = 'Chrome'
  else if (userAgent.includes('Firefox')) navegador = 'Firefox'
  else if (userAgent.includes('Safari')) navegador = 'Safari'
  else if (userAgent.includes('Edge')) navegador = 'Edge'
  
  let sistemaOperativo = 'Desconocido'
  if (userAgent.includes('Windows')) sistemaOperativo = 'Windows'
  else if (userAgent.includes('Mac')) sistemaOperativo = 'macOS'
  else if (userAgent.includes('Linux')) sistemaOperativo = 'Linux'
  else if (userAgent.includes('Android')) sistemaOperativo = 'Android'
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) sistemaOperativo = 'iOS'
  
  return { dispositivo, navegador, sistemaOperativo }
}

/**
 * Obtiene información del contexto de la petición
 */
async function getRequestContext() {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const forwarded = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
    
    const { dispositivo, navegador, sistemaOperativo } = parseUserAgent(userAgent)
    
    return {
      ipAddress,
      userAgent,
      dispositivo,
      navegador,
      sistemaOperativo,
    }
  } catch {
    return {
      ipAddress: 'unknown',
      userAgent: '',
      dispositivo: 'Desconocido',
      navegador: 'Desconocido',
      sistemaOperativo: 'Desconocido',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ACCIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Registrar una entrada de auditoría
 */
export async function registrarAuditoria(
  entry: Omit<AuditEntry, 'id' | 'timestamp' | 'ipAddress' | 'userAgent' | 'dispositivo' | 'navegador' | 'sistemaOperativo'>
): Promise<{ success: boolean; data?: AuditEntry; error?: string }> {
  const startTime = Date.now()
  
  try {
    const context = await getRequestContext()
    const id = nanoid()
    const timestamp = new Date()
    
    const auditEntry: AuditEntry = {
      id,
      ...entry,
      ...context,
      timestamp,
      duracionMs: Date.now() - startTime,
    }
    
    // En producción, guardar en BD
    // await db.insert(auditLog).values({
    //   ...auditEntry,
    //   datosAnteriores: entry.datosAnteriores ? JSON.stringify(entry.datosAnteriores) : null,
    //   datosNuevos: entry.datosNuevos ? JSON.stringify(entry.datosNuevos) : null,
    //   camposModificados: entry.camposModificados ? JSON.stringify(entry.camposModificados) : null,
    //   metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    //   fechaFormateada: timestamp.toLocaleString('es-MX'),
    // })
    
    // Por ahora, log
    logger.info('Auditoría registrada', {
      context: 'Audit',
      data: {
        id,
        usuario: entry.usuarioNombre,
        accion: entry.accion,
        modulo: entry.modulo,
        descripcion: entry.descripcion,
      },
    })
    
    return { success: true, data: auditEntry }
  } catch (error) {
    logger.error('Error al registrar auditoría', error, { context: 'registrarAuditoria' })
    return { success: false, error: 'Error al registrar auditoría' }
  }
}

/**
 * Obtener logs de auditoría con filtros
 */
export async function getAuditLogs(
  filters: AuditFilters = {}
): Promise<{ success: boolean; data?: AuditEntry[]; total?: number; error?: string }> {
  try {
    const { limit = 50, offset = 0 } = filters
    
    // En producción, consultar BD con filtros
    // const conditions = []
    // if (filters.usuarioId) conditions.push(eq(auditLog.usuarioId, filters.usuarioId))
    // if (filters.modulo) conditions.push(eq(auditLog.modulo, filters.modulo))
    // ...etc
    
    // Mock data for development
    const mockLogs: AuditEntry[] = [
      {
        id: '1',
        usuarioId: 'user1',
        usuarioNombre: 'Admin Principal',
        accion: 'crear',
        modulo: 'bancos',
        entidadTipo: 'movimiento',
        entidadId: 'mov1',
        descripcion: 'Registró ingreso de $50,000 en Profit',
        bancoId: 'profit',
        bancoNombre: 'Profit',
        monto: 50000,
        exitoso: true,
        ipAddress: '192.168.1.1',
        dispositivo: 'Desktop',
        navegador: 'Chrome',
        sistemaOperativo: 'Windows',
        timestamp: new Date(),
      },
      {
        id: '2',
        usuarioId: 'user2',
        usuarioNombre: 'Operador 1',
        accion: 'transferir',
        modulo: 'bancos',
        descripcion: 'Transferencia de $25,000 de Bóveda Monte a Profit',
        bancoId: 'boveda_monte',
        bancoNombre: 'Bóveda Monte',
        monto: 25000,
        exitoso: true,
        ipAddress: '192.168.1.2',
        dispositivo: 'Mobile',
        navegador: 'Safari',
        sistemaOperativo: 'iOS',
        timestamp: new Date(Date.now() - 3600000),
      },
    ]
    
    return { success: true, data: mockLogs, total: mockLogs.length }
  } catch (error) {
    logger.error('Error al obtener logs de auditoría', error, { context: 'getAuditLogs' })
    return { success: false, error: 'Error al obtener logs' }
  }
}

/**
 * Obtener estadísticas de auditoría
 */
export async function getAuditStats(
  fechaInicio?: Date,
  fechaFin?: Date
): Promise<{ success: boolean; data?: AuditStats; error?: string }> {
  try {
    // En producción, consultar BD con agregaciones
    const mockStats: AuditStats = {
      totalOperaciones: 1250,
      porModulo: {
        bancos: 450,
        ventas: 320,
        clientes: 180,
        almacen: 150,
        ordenes: 100,
        otros: 50,
      },
      porAccion: {
        ver: 500,
        crear: 350,
        editar: 250,
        eliminar: 50,
        exportar: 100,
      },
      porUsuario: [
        { usuarioId: 'user1', nombre: 'Admin Principal', cantidad: 450 },
        { usuarioId: 'user2', nombre: 'Operador 1', cantidad: 380 },
        { usuarioId: 'user3', nombre: 'Operador 2', cantidad: 270 },
      ],
      operacionesExitosas: 1220,
      operacionesFallidas: 30,
      ultimaHora: 25,
      ultimoDia: 180,
      ultimaSemana: 890,
    }
    
    return { success: true, data: mockStats }
  } catch (error) {
    logger.error('Error al obtener estadísticas', error, { context: 'getAuditStats' })
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}

/**
 * Obtener actividad de un usuario específico
 */
export async function getActividadUsuario(
  usuarioId: string,
  limit = 20
): Promise<{ success: boolean; data?: AuditEntry[]; error?: string }> {
  return getAuditLogs({ usuarioId, limit })
}

/**
 * Obtener actividad reciente del sistema
 */
export async function getActividadReciente(
  limit = 10
): Promise<{ success: boolean; data?: AuditEntry[]; error?: string }> {
  return getAuditLogs({ limit })
}

/**
 * Exportar logs de auditoría
 */
export async function exportarAuditoria(
  filters: AuditFilters,
  formato: 'csv' | 'json' | 'excel'
): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> {
  try {
    const logsResult = await getAuditLogs({ ...filters, limit: 10000 })
    
    if (!logsResult.success || !logsResult.data) {
      return { success: false, error: 'No se pudieron obtener los logs' }
    }
    
    const logs = logsResult.data
    const timestamp = new Date().toISOString().split('T')[0]
    
    if (formato === 'json') {
      return {
        success: true,
        data: JSON.stringify(logs, null, 2),
        filename: `auditoria_${timestamp}.json`,
      }
    }
    
    if (formato === 'csv') {
      const headers = ['ID', 'Fecha', 'Usuario', 'Acción', 'Módulo', 'Descripción', 'Monto', 'IP', 'Dispositivo']
      const rows = logs.map(log => [
        log.id,
        log.timestamp.toISOString(),
        log.usuarioNombre,
        log.accion,
        log.modulo,
        log.descripcion,
        log.monto || '',
        log.ipAddress || '',
        log.dispositivo || '',
      ].join(','))
      
      return {
        success: true,
        data: [headers.join(','), ...rows].join('\n'),
        filename: `auditoria_${timestamp}.csv`,
      }
    }
    
    // Excel se manejaría diferente en producción
    return { success: false, error: 'Formato no soportado' }
  } catch (error) {
    logger.error('Error al exportar auditoría', error, { context: 'exportarAuditoria' })
    return { success: false, error: 'Error al exportar' }
  }
}
