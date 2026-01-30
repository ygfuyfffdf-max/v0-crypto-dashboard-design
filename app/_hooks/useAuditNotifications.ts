/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS INFINITY 2026 — HOOKS DE AUDITORÍA Y NOTIFICACIONES
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hooks personalizados para:
 * - Registro de auditoría automático
 * - Gestión de notificaciones
 * - Verificación de permisos
 * - Exportación de datos
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { auditService, type EntradaAudit, type EstadisticasAudit, type AlertaAudit, obtenerInfoDispositivo } from '@/app/_lib/services/audit-supreme.service'
import { notificacionesService, type Notificacion, type PreferenciasNotificacion } from '@/app/_lib/services/notifications-supreme.service'
import { exportService, type ColumnDefinition, type FormatoExport, type ExportResult } from '@/app/_lib/services/export-supreme.service'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UseAuditOptions {
  usuarioId: string
  usuarioNombre: string
  usuarioEmail?: string
  rolId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseAuditReturn {
  // Datos
  logs: EntradaAudit[]
  estadisticas: EstadisticasAudit | null
  alertas: AlertaAudit[]

  // Estados
  cargando: boolean
  error: string | null

  // Acciones
  registrar: (params: Omit<Parameters<typeof auditService.registrar>[0], 'usuario' | 'dispositivo'>) => Promise<EntradaAudit>
  refrescar: () => Promise<void>
  buscarLogs: (filtros: Parameters<typeof auditService.obtenerLogs>[0]) => Promise<void>
  obtenerHistorial: (tipo: string, id: string) => Promise<EntradaAudit[]>
  atenderAlerta: (alertaId: string) => Promise<void>
  exportarLogs: (formato: FormatoExport) => Promise<ExportResult>
}

export function useAudit(options: UseAuditOptions): UseAuditReturn {
  const [logs, setLogs] = useState<EntradaAudit[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasAudit | null>(null)
  const [alertas, setAlertas] = useState<AlertaAudit[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dispositivoRef = useRef(obtenerInfoDispositivo())

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    try {
      const [logsResult, statsResult, alertasResult] = await Promise.all([
        auditService.obtenerLogs({ limite: 100 }),
        auditService.obtenerEstadisticas(7),
        Promise.resolve(auditService.obtenerAlertasPendientes())
      ])

      setLogs(logsResult.logs)
      setEstadisticas(statsResult)
      setAlertas(alertasResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }, [])

  // Registrar entrada de auditoría
  const registrar = useCallback(async (
    params: Omit<Parameters<typeof auditService.registrar>[0], 'usuario' | 'dispositivo'>
  ) => {
    return auditService.registrar({
      ...params,
      usuario: {
        id: options.usuarioId,
        nombre: options.usuarioNombre,
        email: options.usuarioEmail || '',
        rolId: options.rolId
      },
      dispositivo: dispositivoRef.current
    })
  }, [options])

  // Buscar logs con filtros
  const buscarLogs = useCallback(async (filtros: Parameters<typeof auditService.obtenerLogs>[0]) => {
    setCargando(true)
    try {
      const result = await auditService.obtenerLogs(filtros)
      setLogs(result.logs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCargando(false)
    }
  }, [])

  // Obtener historial de entidad
  const obtenerHistorial = useCallback(async (tipo: string, id: string) => {
    return auditService.obtenerHistorialEntidad(tipo, id)
  }, [])

  // Atender alerta
  const atenderAlerta = useCallback(async (alertaId: string) => {
    await auditService.atenderAlerta(alertaId, options.usuarioId)
    setAlertas(auditService.obtenerAlertasPendientes())
  }, [options.usuarioId])

  // Exportar logs
  const exportarLogs = useCallback(async (formato: FormatoExport) => {
    const columnas: ColumnDefinition[] = [
      { key: 'timestamp', header: 'Fecha/Hora', formato: 'fechaHora' },
      { key: 'usuario', header: 'Usuario' },
      { key: 'accion', header: 'Acción' },
      { key: 'modulo', header: 'Módulo' },
      { key: 'descripcion', header: 'Descripción' },
      { key: 'ip', header: 'IP' },
      { key: 'dispositivo', header: 'Dispositivo' }
    ]

    const datosExport = logs.map(l => ({
      timestamp: l.timestamp,
      usuario: l.usuario.nombre,
      accion: l.accion,
      modulo: l.modulo,
      descripcion: l.descripcion,
      ip: l.dispositivo.ip,
      dispositivo: l.dispositivo.dispositivo
    }))

    return exportService.exportar({
      datos: datosExport,
      columnas,
      configuracion: {
        formato,
        nombreArchivo: `audit_log_${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : formato}`
      },
      usuarioId: options.usuarioId,
      usuarioNombre: options.usuarioNombre
    })
  }, [logs, options])

  // Cargar datos iniciales y suscribirse
  useEffect(() => {
    cargarDatos()

    const unsubscribe = auditService.suscribir((entrada) => {
      setLogs(prev => [entrada, ...prev.slice(0, 99)])
    })

    // Auto-refresh si está habilitado
    let interval: NodeJS.Timeout | undefined
    if (options.autoRefresh) {
      interval = setInterval(cargarDatos, options.refreshInterval || 30000)
    }

    return () => {
      unsubscribe()
      if (interval) clearInterval(interval)
    }
  }, [cargarDatos, options.autoRefresh, options.refreshInterval])

  return {
    logs,
    estadisticas,
    alertas,
    cargando,
    error,
    registrar,
    refrescar: cargarDatos,
    buscarLogs,
    obtenerHistorial,
    atenderAlerta,
    exportarLogs
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK DE NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UseNotificationsOptions {
  usuarioId: string
  autoRefresh?: boolean
}

interface UseNotificationsReturn {
  notificaciones: Notificacion[]
  noLeidas: number
  preferencias: PreferenciasNotificacion | null
  cargando: boolean

  // Acciones
  marcarLeida: (id: string) => void
  marcarTodasLeidas: () => void
  archivar: (id: string) => void
  fijar: (id: string) => boolean
  eliminar: (id: string) => void
  actualizarPreferencias: (prefs: Partial<PreferenciasNotificacion>) => void
  refrescar: () => void
}

export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [preferencias, setPreferencias] = useState<PreferenciasNotificacion | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarNotificaciones = useCallback(() => {
    setCargando(true)
    const notifs = notificacionesService.obtenerNotificaciones(options.usuarioId, { archivada: false })
    setNotificaciones(notifs)
    setNoLeidas(notificacionesService.obtenerConteoNoLeidas(options.usuarioId))
    setPreferencias(notificacionesService.obtenerPreferencias(options.usuarioId))
    setCargando(false)
  }, [options.usuarioId])

  const marcarLeida = useCallback((id: string) => {
    notificacionesService.marcarComoLeida(options.usuarioId, id)
    cargarNotificaciones()
  }, [options.usuarioId, cargarNotificaciones])

  const marcarTodasLeidas = useCallback(() => {
    notificacionesService.marcarTodasComoLeidas(options.usuarioId)
    cargarNotificaciones()
  }, [options.usuarioId, cargarNotificaciones])

  const archivar = useCallback((id: string) => {
    notificacionesService.archivar(options.usuarioId, id)
    cargarNotificaciones()
  }, [options.usuarioId, cargarNotificaciones])

  const fijar = useCallback((id: string) => {
    const resultado = notificacionesService.toggleFijada(options.usuarioId, id)
    cargarNotificaciones()
    return resultado
  }, [options.usuarioId, cargarNotificaciones])

  const eliminar = useCallback((id: string) => {
    notificacionesService.eliminar(options.usuarioId, id)
    cargarNotificaciones()
  }, [options.usuarioId, cargarNotificaciones])

  const actualizarPreferencias = useCallback((prefs: Partial<PreferenciasNotificacion>) => {
    notificacionesService.actualizarPreferencias(options.usuarioId, prefs)
    setPreferencias(notificacionesService.obtenerPreferencias(options.usuarioId))
  }, [options.usuarioId])

  useEffect(() => {
    cargarNotificaciones()

    const unsubscribe = notificacionesService.suscribir(options.usuarioId, () => {
      cargarNotificaciones()
    })

    return () => unsubscribe()
  }, [cargarNotificaciones, options.usuarioId])

  return {
    notificaciones,
    noLeidas,
    preferencias,
    cargando,
    marcarLeida,
    marcarTodasLeidas,
    archivar,
    fijar,
    eliminar,
    actualizarPreferencias,
    refrescar: cargarNotificaciones
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK DE EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UseExportOptions {
  usuarioId: string
  usuarioNombre: string
}

interface UseExportReturn {
  exportar: <T extends Record<string, unknown>>(params: {
    datos: T[]
    columnas: ColumnDefinition[]
    formato: FormatoExport
    nombreArchivo: string
  }) => Promise<ExportResult>
  descargar: (resultado: ExportResult) => void
  historial: ReturnType<typeof exportService.obtenerHistorial>
}

export function useExport(options: UseExportOptions): UseExportReturn {
  const [historial, setHistorial] = useState(exportService.obtenerHistorial(options.usuarioId))

  const exportar = useCallback(async <T extends Record<string, unknown>>(params: {
    datos: T[]
    columnas: ColumnDefinition[]
    formato: FormatoExport
    nombreArchivo: string
  }) => {
    const resultado = await exportService.exportar({
      datos: params.datos,
      columnas: params.columnas,
      configuracion: {
        formato: params.formato,
        nombreArchivo: params.nombreArchivo
      },
      usuarioId: options.usuarioId,
      usuarioNombre: options.usuarioNombre
    })

    setHistorial(exportService.obtenerHistorial(options.usuarioId))
    return resultado
  }, [options])

  const descargar = useCallback((resultado: ExportResult) => {
    exportService.descargar(resultado)
    setHistorial(exportService.obtenerHistorial(options.usuarioId))
  }, [options.usuarioId])

  return { exportar, descargar, historial }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK DE OPERACIÓN AUDITADA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook que envuelve una operación con registro de auditoría automático
 */
interface UseAuditedOperationOptions<TInput, TResult> {
  usuarioId: string
  usuarioNombre: string
  modulo: Parameters<typeof auditService.registrar>[0]['modulo']
  accion: Parameters<typeof auditService.registrar>[0]['accion']
  descripcionFn: (input: TInput, result?: TResult) => string
  operacion: (input: TInput) => Promise<TResult>
  entidadFn?: (input: TInput, result?: TResult) => { tipo: string; id: string; nombre: string } | undefined
  onSuccess?: (result: TResult) => void
  onError?: (error: Error) => void
}

export function useAuditedOperation<TInput, TResult>(
  options: UseAuditedOperationOptions<TInput, TResult>
) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dispositivoRef = useRef(obtenerInfoDispositivo())

  const ejecutar = useCallback(async (input: TInput): Promise<TResult | null> => {
    setCargando(true)
    setError(null)
    const inicio = Date.now()

    try {
      const result = await options.operacion(input)

      // Registrar éxito
      await auditService.registrar({
        usuario: {
          id: options.usuarioId,
          nombre: options.usuarioNombre,
          email: ''
        },
        accion: options.accion,
        modulo: options.modulo,
        descripcion: options.descripcionFn(input, result),
        entidad: options.entidadFn?.(input, result),
        dispositivo: dispositivoRef.current,
        exitoso: true,
        duracionMs: Date.now() - inicio
      })

      options.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'

      // Registrar error
      await auditService.registrar({
        usuario: {
          id: options.usuarioId,
          nombre: options.usuarioNombre,
          email: ''
        },
        accion: options.accion,
        modulo: options.modulo,
        descripcion: options.descripcionFn(input),
        severidad: 'error',
        dispositivo: dispositivoRef.current,
        exitoso: false,
        mensajeError: errorMsg,
        duracionMs: Date.now() - inicio
      })

      setError(errorMsg)
      options.onError?.(err as Error)
      return null
    } finally {
      setCargando(false)
    }
  }, [options])

  return { ejecutar, cargando, error }
}
