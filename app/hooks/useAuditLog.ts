/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - useAuditLog Hook                       ║
 * ║                    Hook para Gestión de Registros de Auditoría            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

'use client'

import {
  exportAuditLogs,
  getAuditLogs,
  getAuditStats,
  type AuditAction,
  type AuditEntry,
  type AuditSeverity,
} from '@/app/lib/audit/auditService'
import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface AuditLogFilters {
  action?: AuditAction
  resource?: string
  userId?: string
  severity?: AuditSeverity
  startDate?: Date
  endDate?: Date
  limit?: number
}

interface UseAuditLogOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  initialFilters?: AuditLogFilters
}

/**
 * Hook para gestionar registros de auditoría
 *
 * @example
 * ```tsx
 * const { logs, filters, setFilters, stats, exportLogs, refresh } = useAuditLog({
 *   autoRefresh: true,
 *   refreshInterval: 30000, // 30 segundos
 * })
 * ```
 */
export function useAuditLog(options: UseAuditLogOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000, initialFilters = {} } = options

  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [filters, setFilters] = useState<AuditLogFilters>(initialFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Carga los logs con los filtros actuales
   */
  const loadLogs = useCallback(() => {
    try {
      setLoading(true)
      setError(null)

      const fetchedLogs = getAuditLogs(filters)
      setLogs(fetchedLogs)

      logger.debug('Logs de auditoría cargados', {
        context: 'useAuditLog',
        data: { count: fetchedLogs.length, filters },
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido')
      setError(error)
      logger.error('Error al cargar logs de auditoría', error, {
        context: 'useAuditLog',
      })
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * Refresca los logs
   */
  const refresh = useCallback(() => {
    loadLogs()
  }, [loadLogs])

  /**
   * Exporta los logs actuales
   */
  const exportLogs = useCallback((): string => {
    logger.info('Exportando logs de auditoría', {
      context: 'useAuditLog',
      data: { count: logs.length },
    })
    return exportAuditLogs(filters)
  }, [logs.length, filters])

  /**
   * Descarga los logs como archivo JSON
   */
  const downloadLogs = useCallback(() => {
    const json = exportLogs()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.info('Logs de auditoría descargados', {
      context: 'useAuditLog',
    })
  }, [exportLogs])

  /**
   * Obtiene estadísticas de auditoría
   */
  const stats = useMemo(() => {
    return getAuditStats()
  }, [logs])

  /**
   * Agrupa logs por acción
   */
  const logsByAction = useMemo(() => {
    const grouped: Record<AuditAction, AuditEntry[]> = {} as Record<AuditAction, AuditEntry[]>

    logs.forEach((log) => {
      if (!grouped[log.action]) {
        grouped[log.action] = []
      }
      grouped[log.action].push(log)
    })

    return grouped
  }, [logs])

  /**
   * Agrupa logs por severidad
   */
  const logsBySeverity = useMemo(() => {
    const grouped: Record<AuditSeverity, AuditEntry[]> = {} as Record<AuditSeverity, AuditEntry[]>

    logs.forEach((log) => {
      if (!grouped[log.severity]) {
        grouped[log.severity] = []
      }
      grouped[log.severity].push(log)
    })

    return grouped
  }, [logs])

  /**
   * Agrupa logs por recurso
   */
  const logsByResource = useMemo(() => {
    const grouped: Record<string, AuditEntry[]> = {}

    logs.forEach((log) => {
      if (!grouped[log.resource]) {
        grouped[log.resource] = []
      }
      const arr = grouped[log.resource]
      if (arr) arr.push(log)
    })

    return grouped
  }, [logs])

  /**
   * Actualiza un filtro específico
   */
  const updateFilter = useCallback(
    <K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    [],
  )

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Carga inicial
  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadLogs()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, loadLogs])

  return {
    // Datos
    logs,
    stats,
    logsByAction,
    logsBySeverity,
    logsByResource,

    // Estado
    loading,
    error,

    // Filtros
    filters,
    setFilters,
    updateFilter,
    clearFilters,

    // Acciones
    refresh,
    exportLogs,
    downloadLogs,
  }
}

/**
 * Hook para obtener logs de una acción específica
 */
export function useAuditLogsByAction(action: AuditAction, limit = 50) {
  const { logs, loading, error } = useAuditLog({
    initialFilters: { action, limit },
  })

  return { logs, loading, error }
}

/**
 * Hook para obtener logs de un usuario específico
 */
export function useAuditLogsByUser(userId: string, limit = 50) {
  const { logs, loading, error } = useAuditLog({
    initialFilters: { userId, limit },
  })

  return { logs, loading, error }
}

/**
 * Hook para obtener logs de un recurso específico
 */
export function useAuditLogsByResource(resource: string, limit = 50) {
  const { logs, loading, error } = useAuditLog({
    initialFilters: { resource, limit },
  })

  return { logs, loading, error }
}
