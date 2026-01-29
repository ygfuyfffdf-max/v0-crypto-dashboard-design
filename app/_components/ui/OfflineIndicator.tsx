'use client'

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 CHRONOS INFINITY 2026 — OFFLINE STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════
// Indicador visual de estado de conexión con sincronización
// ═══════════════════════════════════════════════════════════════════════════════

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Wifi, WifiOff, RefreshCw, Check, AlertTriangle } from 'lucide-react'
import { useOfflineSync } from '@/app/_hooks/useOfflineSync'
import { cn } from '@/app/_lib/utils'

interface OfflineIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function OfflineIndicator({ className, showDetails = true }: OfflineIndicatorProps) {
  const { isOnline, isSyncing, pendingCount, lastSyncTime, syncNow, syncError } = useOfflineSync()

  // Si está online y no hay pendientes, mostrar mínimo o nada
  if (isOnline && pendingCount === 0 && !showDetails) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          'fixed right-4 bottom-4 z-50',
          'rounded-xl backdrop-blur-xl',
          'border border-white/10',
          'shadow-2xl shadow-black/20',
          isOnline ? 'bg-black/60' : 'bg-red-900/60',
          className,
        )}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Status Icon */}
          <div className={cn('rounded-lg p-2', isOnline ? 'bg-green-500/20' : 'bg-red-500/20')}>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
          </div>

          {/* Status Text */}
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {isOnline ? 'En línea' : 'Sin conexión'}
            </p>
            {pendingCount > 0 && (
              <p className="text-xs text-white/60">
                {pendingCount} {pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}
              </p>
            )}
            {syncError && (
              <p className="flex items-center gap-1 text-xs text-yellow-400">
                <AlertTriangle className="h-3 w-3" />
                {syncError}
              </p>
            )}
          </div>

          {/* Sync Button */}
          {isOnline && pendingCount > 0 && (
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className={cn(
                'rounded-lg p-2 transition-colors',
                'bg-violet-500/20 hover:bg-violet-500/30',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <RefreshCw className={cn('h-4 w-4 text-violet-400', isSyncing && 'animate-spin')} />
            </button>
          )}

          {/* Success indicator */}
          {isOnline && pendingCount === 0 && lastSyncTime && (
            <div className="rounded-lg bg-green-500/20 p-2">
              <Check className="h-4 w-4 text-green-400" />
            </div>
          )}
        </div>

        {/* Last sync time */}
        {showDetails && lastSyncTime && (
          <div className="px-4 pt-0 pb-3">
            <p className="text-xs text-white/40">
              Última sincronización: {lastSyncTime.toLocaleTimeString('es-MX')}
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default OfflineIndicator
