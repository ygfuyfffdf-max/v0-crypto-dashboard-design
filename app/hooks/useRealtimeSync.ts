/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - useRealtimeSync Hook                   ║
 * ║                    Hook para Sincronización en Tiempo Real                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/app/lib/store/useAppStore'
import { logger } from '@/app/lib/utils/logger'
import { toast } from 'sonner'

interface RealtimeSyncOptions {
  /** Intervalo de polling en milisegundos */
  pollingInterval?: number
  /** Mostrar notificaciones toast cuando hay cambios */
  showNotifications?: boolean
  /** Callback cuando se detectan cambios */
  onDataChange?: (resource: string) => void
}

/**
 * Hook para sincronización en tiempo real usando polling
 * En producción se podría usar WebSockets o Server-Sent Events
 *
 * @example
 * ```tsx
 * const { startSync, stopSync, isSyncing } = useRealtimeSync({
 *   pollingInterval: 5000,
 *   showNotifications: true,
 * })
 *
 * useEffect(() => {
 *   startSync()
 *   return () => stopSync()
 * }, [])
 * ```
 */
export function useRealtimeSync(options: RealtimeSyncOptions = {}) {
  const {
    pollingInterval = 10000, // 10 segundos por defecto
    showNotifications = true,
    onDataChange,
  } = options

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncRef = useRef<Record<string, number>>({})
  const triggerDataRefresh = useAppStore((state) => state.triggerDataRefresh)

  /**
   * Verifica cambios en un recurso específico
   */
  const checkResourceChanges = useCallback(
    async (resource: string) => {
      try {
        // En producción, esto haría una llamada a la API para obtener el timestamp
        // de la última modificación del recurso
        // Por ahora, simulamos verificación local

        const now = Date.now()
        const lastSync = lastSyncRef.current[resource] || 0

        // Simular detección de cambios (en producción vendría del servidor)
        const hasChanges = Math.random() > 0.9 // 10% de probabilidad de cambios

        if (hasChanges) {
          logger.info('Cambios detectados en tiempo real', {
            context: 'RealtimeSync',
            data: { resource, lastSync: new Date(lastSync), now: new Date(now) },
          })

          lastSyncRef.current[resource] = now

          if (showNotifications) {
            toast.info(`Nuevos datos disponibles en ${resource}`, {
              description: 'Actualizando información...',
              duration: 3000,
            })
          }

          onDataChange?.(resource)
          triggerDataRefresh()

          return true
        }

        return false
      } catch (error) {
        logger.error('Error al verificar cambios', error as Error, {
          context: 'RealtimeSync',
          data: { resource },
        })
        return false
      }
    },
    [showNotifications, onDataChange, triggerDataRefresh],
  )

  /**
   * Sincroniza todos los recursos monitoreados
   */
  const syncAllResources = useCallback(async () => {
    const resources = ['ventas', 'bancos', 'clientes', 'almacen', 'ordenes']

    logger.debug('Sincronizando recursos en tiempo real', {
      context: 'RealtimeSync',
      data: { resources },
    })

    const results = await Promise.all(resources.map((resource) => checkResourceChanges(resource)))

    const changesDetected = results.some((changed) => changed)

    if (changesDetected) {
      logger.info('Sincronización completada con cambios', {
        context: 'RealtimeSync',
      })
    }
  }, [checkResourceChanges])

  /**
   * Inicia la sincronización en tiempo real
   */
  const startSync = useCallback(() => {
    if (intervalRef.current) {
      logger.warn('Sincronización ya está activa', {
        context: 'RealtimeSync',
      })
      return
    }

    logger.info('Iniciando sincronización en tiempo real', {
      context: 'RealtimeSync',
      data: { pollingInterval },
    })

    // Primera sincronización inmediata
    syncAllResources()

    // Configurar polling
    intervalRef.current = setInterval(() => {
      syncAllResources()
    }, pollingInterval)
  }, [pollingInterval, syncAllResources])

  /**
   * Detiene la sincronización en tiempo real
   */
  const stopSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null

      logger.info('Sincronización en tiempo real detenida', {
        context: 'RealtimeSync',
      })
    }
  }, [])

  /**
   * Fuerza una sincronización manual inmediata
   */
  const forceSync = useCallback(() => {
    logger.info('Forzando sincronización manual', {
      context: 'RealtimeSync',
    })
    syncAllResources()
  }, [syncAllResources])

  /**
   * Verifica si la sincronización está activa
   */
  const isSyncing = intervalRef.current !== null

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    startSync,
    stopSync,
    forceSync,
    isSyncing,
    checkResourceChanges,
  }
}

/**
 * Hook para sincronizar un recurso específico
 *
 * @example
 * ```tsx
 * useRealtimeResource('ventas', {
 *   pollingInterval: 5000,
 *   onUpdate: (data) => logger.info('Ventas actualizadas:', { data }),
 * })
 * ```
 */
export function useRealtimeResource(
  resource: string,
  options: Omit<RealtimeSyncOptions, 'onDataChange'> & {
    onUpdate?: (resource: string) => void
  } = {},
) {
  const { onUpdate, ...syncOptions } = options

  const { startSync, stopSync, isSyncing } = useRealtimeSync({
    ...syncOptions,
    onDataChange: (changedResource) => {
      if (changedResource === resource) {
        onUpdate?.(changedResource)
      }
    },
  })

  useEffect(() => {
    startSync()
    return () => stopSync()
  }, [startSync, stopSync])

  return { isSyncing }
}

/**
 * Hook para suscribirse a cambios en ventas
 */
export function useRealtimeVentas(
  options: Omit<RealtimeSyncOptions, 'onDataChange'> & {
    onNewVenta?: () => void
  } = {},
) {
  const { onNewVenta, ...syncOptions } = options

  return useRealtimeResource('ventas', {
    ...syncOptions,
    onUpdate: () => {
      onNewVenta?.()
    },
  })
}

/**
 * Hook para suscribirse a cambios en bancos
 */
export function useRealtimeBancos(
  options: Omit<RealtimeSyncOptions, 'onDataChange'> & {
    onBalanceChange?: () => void
  } = {},
) {
  const { onBalanceChange, ...syncOptions } = options

  return useRealtimeResource('bancos', {
    ...syncOptions,
    onUpdate: () => {
      onBalanceChange?.()
    },
  })
}

/**
 * Hook para suscribirse a cambios en clientes
 */
export function useRealtimeClientes(
  options: Omit<RealtimeSyncOptions, 'onDataChange'> & {
    onClientUpdate?: () => void
  } = {},
) {
  const { onClientUpdate, ...syncOptions } = options

  return useRealtimeResource('clientes', {
    ...syncOptions,
    onUpdate: () => {
      onClientUpdate?.()
    },
  })
}
