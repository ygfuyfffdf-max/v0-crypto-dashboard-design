// app/_hooks/useOfflineSync.ts
// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 CHRONOS INFINITY 2026 — OFFLINE SYNC HOOK
// ═══════════════════════════════════════════════════════════════════════════════
// Sincronización automática cuando se recupera la conexión
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface PendingOperation {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  collection: string
  data: Record<string, unknown>
  timestamp: number
  retries: number
}

interface OfflineSyncState {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSyncTime: Date | null
  syncError: string | null
}

interface UseOfflineSyncReturn extends OfflineSyncState {
  queueOperation: (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>) => void
  syncNow: () => Promise<void>
  clearPendingOperations: () => void
  getPendingOperations: () => PendingOperation[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE KEY
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'chronos_pending_operations'
const MAX_RETRIES = 3
const SYNC_INTERVAL = 30000 // 30 segundos

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function useOfflineSync(): UseOfflineSyncReturn {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    syncError: null,
  })

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTENCIA
  // ═══════════════════════════════════════════════════════════════════════════

  const loadPendingOperations = useCallback((): PendingOperation[] => {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      logger.error('Error loading pending operations', error as Error, {
        context: 'useOfflineSync',
      })
      return []
    }
  }, [])

  const savePendingOperations = useCallback((operations: PendingOperation[]): void => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(operations))
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, pendingCount: operations.length }))
      }
    } catch (error) {
      logger.error('Error saving pending operations', error as Error, { context: 'useOfflineSync' })
    }
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════
  // QUEUE OPERATION
  // ═══════════════════════════════════════════════════════════════════════════

  const queueOperation = useCallback(
    (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): void => {
      const pending = loadPendingOperations()

      const newOperation: PendingOperation = {
        ...operation,
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retries: 0,
      }

      pending.push(newOperation)
      savePendingOperations(pending)

      logger.info('Queued offline operation', {
        context: 'useOfflineSync',
        data: { type: operation.type, collection: operation.collection },
      })
    },
    [loadPendingOperations, savePendingOperations],
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC
  // ═══════════════════════════════════════════════════════════════════════════

  const syncNow = useCallback(async (): Promise<void> => {
    if (!state.isOnline) {
      logger.info('Skipping sync - offline', { context: 'useOfflineSync' })
      return
    }

    const pending = loadPendingOperations()
    if (pending.length === 0) return

    setState((prev) => ({ ...prev, isSyncing: true, syncError: null }))

    const failed: PendingOperation[] = []

    for (const operation of pending) {
      try {
        // Construir la URL del API
        const url = `/api/${operation.collection}`

        let method: string
        let body: string | undefined

        switch (operation.type) {
          case 'CREATE':
            method = 'POST'
            body = JSON.stringify(operation.data)
            break
          case 'UPDATE':
            method = 'PUT'
            body = JSON.stringify(operation.data)
            break
          case 'DELETE':
            method = 'DELETE'
            break
          default:
            continue
        }

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        logger.info('Synced operation successfully', {
          context: 'useOfflineSync',
          data: { id: operation.id, type: operation.type },
        })
      } catch (error) {
        operation.retries++

        if (operation.retries < MAX_RETRIES) {
          failed.push(operation)
          logger.warn(`Sync failed, will retry (${operation.retries}/${MAX_RETRIES})`, {
            context: 'useOfflineSync',
            data: { id: operation.id },
          })
        } else {
          logger.error('Operation exceeded max retries, discarding', error as Error, {
            context: 'useOfflineSync',
            data: { id: operation.id },
          })
        }
      }
    }

    savePendingOperations(failed)

    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        syncError: failed.length > 0 ? `${failed.length} operaciones pendientes` : null,
      }))
    }
  }, [state.isOnline, loadPendingOperations, savePendingOperations])

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  const clearPendingOperations = useCallback((): void => {
    savePendingOperations([])
    logger.info('Cleared all pending operations', { context: 'useOfflineSync' })
  }, [savePendingOperations])

  const getPendingOperations = useCallback((): PendingOperation[] => {
    return loadPendingOperations()
  }, [loadPendingOperations])

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }))
      logger.info('Connection restored', { context: 'useOfflineSync' })
      // Sincronizar automáticamente al volver online
      syncNow()
    }

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }))
      logger.info('Connection lost', { context: 'useOfflineSync' })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cargar estado inicial
    const pending = loadPendingOperations()
    setState((prev) => ({ ...prev, pendingCount: pending.length }))

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [loadPendingOperations, syncNow])

  // Periodic sync
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (state.isOnline) {
        syncNow()
      }
    }, SYNC_INTERVAL)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [state.isOnline, syncNow])

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    ...state,
    queueOperation,
    syncNow,
    clearPendingOperations,
    getPendingOperations,
  }
}

export default useOfflineSync
