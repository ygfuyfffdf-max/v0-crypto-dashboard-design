/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔒 CHRONOS INFINITY 2026 — Audit Logger
 * ═══════════════════════════════════════════════════════════════════════════════
 * Sistema de auditoría para tracking de acciones críticas
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

/**
 * Tipos de acciones auditables
 */
export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'TRANSFER'
  | 'PAYMENT'
  | 'REFUND'
  | 'PERMISSION_CHANGE'
  | 'SETTINGS_CHANGE'
  | 'CONFIG_CHANGE'
  | 'ERROR'

/**
 * Niveles de severidad
 */
export type AuditSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'WARNING' | 'ERROR' | 'CRITICAL'

/**
 * Estructura de un registro de auditoría
 */
export interface AuditEntry {
  id: string
  timestamp: string
  action: AuditAction
  resource: string
  resourceId?: string
  userId?: string
  userEmail?: string
  severity: AuditSeverity
  success: boolean
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  duration?: number
}

/**
 * Parámetros para crear un registro de auditoría
 */
export interface LogAuditParams {
  action: AuditAction
  resource: string
  resourceId?: string
  userId?: string
  userEmail?: string
  severity?: AuditSeverity
  success?: boolean
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  duration?: number
  errorMessage?: string
}

// Almacén de auditoría en memoria (en producción usar base de datos)
const auditLog: AuditEntry[] = []
const MAX_AUDIT_ENTRIES = 10000

/**
 * Genera un ID único para el registro
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Registra un evento de auditoría
 */
export async function logAudit(params: LogAuditParams): Promise<AuditEntry> {
  const entry: AuditEntry = {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    userId: params.userId,
    userEmail: params.userEmail,
    severity: params.severity || 'INFO',
    success: params.success ?? true,
    details: params.details,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    duration: params.duration,
  }

  // Mantener límite de entradas
  if (auditLog.length >= MAX_AUDIT_ENTRIES) {
    auditLog.shift()
  }

  auditLog.push(entry)

  // Log a consola según severidad
  const logMethod =
    entry.severity === 'ERROR' || entry.severity === 'CRITICAL'
      ? 'error'
      : entry.severity === 'WARN'
        ? 'warn'
        : 'info'

  logger[logMethod](`[AUDIT] ${entry.action} on ${entry.resource}`, {
    context: 'AuditLogger',
    data: {
      id: entry.id,
      userId: entry.userId,
      success: entry.success,
      resourceId: entry.resourceId,
    },
  })

  return entry
}

/**
 * Helper para crear registros de auditoría con tipado fuerte
 */
export const audit = {
  login: (userId: string, success: boolean, details?: Record<string, unknown>) =>
    logAudit({
      action: 'LOGIN',
      resource: 'auth',
      userId,
      success,
      severity: success ? 'INFO' : 'WARN',
      details,
    }),

  logout: (userId: string) =>
    logAudit({
      action: 'LOGOUT',
      resource: 'auth',
      userId,
      success: true,
      severity: 'INFO',
    }),

  create: (
    resource: string,
    resourceId: string,
    userId?: string,
    details?: Record<string, unknown>,
  ) =>
    logAudit({
      action: 'CREATE',
      resource,
      resourceId,
      userId,
      success: true,
      severity: 'INFO',
      details,
    }),

  update: (
    resource: string,
    resourceId: string,
    userId?: string,
    details?: Record<string, unknown>,
  ) =>
    logAudit({
      action: 'UPDATE',
      resource,
      resourceId,
      userId,
      success: true,
      severity: 'INFO',
      details,
    }),

  delete: (
    resource: string,
    resourceId: string,
    userId?: string,
    details?: Record<string, unknown>,
  ) =>
    logAudit({
      action: 'DELETE',
      resource,
      resourceId,
      userId,
      success: true,
      severity: 'WARN',
      details,
    }),

  error: (resource: string, error: Error, userId?: string, details?: Record<string, unknown>) =>
    logAudit({
      action: 'ERROR',
      resource,
      userId,
      success: false,
      severity: 'ERROR',
      details: {
        ...details,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    }),

  transfer: (resourceId: string, userId: string, details: Record<string, unknown>) =>
    logAudit({
      action: 'TRANSFER',
      resource: 'banco',
      resourceId,
      userId,
      success: true,
      severity: 'INFO',
      details,
    }),

  payment: (resourceId: string, userId: string, details: Record<string, unknown>) =>
    logAudit({
      action: 'PAYMENT',
      resource: 'venta',
      resourceId,
      userId,
      success: true,
      severity: 'INFO',
      details,
    }),

  // Helpers adicionales para CHRONOS
  ventaCreada: (ventaId: string, userId: string, details?: Record<string, unknown>) =>
    logAudit({
      action: 'CREATE',
      resource: 'ventas',
      resourceId: ventaId,
      userId,
      success: true,
      severity: 'INFO',
      details,
    }),

  ventaActualizada: (ventaId: string, userId: string, details?: Record<string, unknown>) =>
    logAudit({
      action: 'UPDATE',
      resource: 'ventas',
      resourceId: ventaId,
      userId,
      success: true,
      severity: 'INFO',
      details,
    }),

  transferencia: (origenId: string, destinoId: string, monto: number, userId: string) =>
    logAudit({
      action: 'TRANSFER',
      resource: 'bancos',
      resourceId: `${origenId}->${destinoId}`,
      userId,
      success: true,
      severity: 'INFO',
      details: { origen: origenId, destino: destinoId, monto },
    }),

  loginSuccess: (userId: string, ipAddress?: string) =>
    logAudit({
      action: 'LOGIN',
      resource: 'auth',
      userId,
      ipAddress,
      success: true,
      severity: 'INFO',
    }),

  loginFailed: (email: string, ipAddress?: string, reason?: string) =>
    logAudit({
      action: 'LOGIN_FAILED',
      resource: 'auth',
      ipAddress,
      success: false,
      severity: 'WARNING',
      details: { email, reason },
    }),

  dataExport: (resource: string, userId: string, recordCount: number) =>
    logAudit({
      action: 'EXPORT',
      resource,
      userId,
      success: true,
      severity: 'INFO',
      details: { recordCount },
    }),

  criticalError: (resource: string, error: Error, details?: Record<string, unknown>) =>
    logAudit({
      action: 'ERROR',
      resource,
      success: false,
      severity: 'CRITICAL',
      details: {
        ...details,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    }),
}

/**
 * Obtiene registros de auditoría filtrados
 */
export function getAuditLogs(filters?: {
  action?: AuditAction
  resource?: string
  userId?: string
  severity?: AuditSeverity
  startDate?: Date
  endDate?: Date
  limit?: number
}): AuditEntry[] {
  let results = [...auditLog]

  if (filters?.action) {
    results = results.filter((e) => e.action === filters.action)
  }

  if (filters?.resource) {
    results = results.filter((e) => e.resource === filters.resource)
  }

  if (filters?.userId) {
    results = results.filter((e) => e.userId === filters.userId)
  }

  if (filters?.severity) {
    results = results.filter((e) => e.severity === filters.severity)
  }

  if (filters?.startDate) {
    results = results.filter((e) => new Date(e.timestamp) >= filters.startDate!)
  }

  if (filters?.endDate) {
    results = results.filter((e) => new Date(e.timestamp) <= filters.endDate!)
  }

  // Ordenar por timestamp descendente
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (filters?.limit) {
    results = results.slice(0, filters.limit)
  }

  return results
}

/**
 * Obtiene un registro de auditoría por ID
 */
export function getAuditById(id: string): AuditEntry | undefined {
  return auditLog.find((e) => e.id === id)
}

/**
 * Obtiene estadísticas de auditoría
 */
export function getAuditStats(): {
  total: number
  byAction: Record<AuditAction, number>
  bySeverity: Record<AuditSeverity, number>
  successRate: number
} {
  const byAction = {} as Record<AuditAction, number>
  const bySeverity = {} as Record<AuditSeverity, number>
  let successCount = 0

  for (const entry of auditLog) {
    byAction[entry.action] = (byAction[entry.action] || 0) + 1
    bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1
    if (entry.success) successCount++
  }

  return {
    total: auditLog.length,
    byAction,
    bySeverity,
    successRate: auditLog.length > 0 ? (successCount / auditLog.length) * 100 : 100,
  }
}

/**
 * Limpia todos los registros (para tests)
 */
export function clearAuditLogs(): void {
  auditLog.length = 0
}

/**
 * Exporta registros de auditoría a JSON
 */
export function exportAuditLogs(filters?: Parameters<typeof getAuditLogs>[0]): string {
  const logs = getAuditLogs(filters)
  return JSON.stringify(logs, null, 2)
}
