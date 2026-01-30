/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔔 CHRONOS INFINITY 2026 — NOTIFICACIONES EN TIEMPO REAL
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de notificaciones ultra-premium con:
 * - WebSocket en tiempo real
 * - Animaciones fluidas
 * - Sonidos opcionales
 * - Historial persistente
 * - Prioridades y categorías
 * - Acciones rápidas
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  Trash2,
} from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useWebSocketNotifications } from '@/app/lib/hooks/useWebSocket'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface NotificationItemProps {
  notification: {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: number
    read: boolean
  }
  onRead: (id: string) => void
  onClear: (id: string) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: NotificationItem
// ═══════════════════════════════════════════════════════════════════════════════════════

function NotificationItem({ notification, onRead, onClear }: NotificationItemProps) {
  const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  }

  const colorMap = {
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  const Icon = iconMap[notification.type]
  const timeAgo = useTimeAgo(notification.timestamp)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      className={cn(
        'group relative flex gap-3 rounded-lg border p-4 transition-all',
        'backdrop-blur-xl',
        notification.read
          ? 'bg-white/[0.02] border-white/5 opacity-60'
          : 'bg-white/[0.05] border-white/10',
        'hover:bg-white/[0.08] hover:border-white/15'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
          colorMap[notification.type]
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
          <time className="text-xs text-white/40">{timeAgo}</time>
        </div>
        <p className="text-sm text-white/60">{notification.message}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <button
            onClick={() => onRead(notification.id)}
            className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            title="Marcar como leído"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onClear(notification.id)}
          className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
          title="Eliminar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 h-12 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-purple-500 to-pink-500" />
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: NotificationPanel
// ═══════════════════════════════════════════════════════════════════════════════════════

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useWebSocketNotifications()

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-lg',
          'border border-white/10 bg-white/5 backdrop-blur-xl',
          'transition-all hover:bg-white/10 hover:border-white/20',
          isOpen && 'bg-white/10 border-white/20'
        )}
      >
        <Bell className="h-5 w-5 text-white/80" />
        
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 px-1.5 text-[10px] font-bold text-white shadow-lg"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Panel Content */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-4 top-20 z-50 flex h-[calc(100vh-6rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-white/60">{unreadCount} sin leer</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
                    >
                      Marcar todo como leído
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                <AnimatePresence mode="popLayout">
                  {notifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex h-full flex-col items-center justify-center gap-3 text-center"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                        <Bell className="h-8 w-8 text-white/20" />
                      </div>
                      <p className="text-sm text-white/40">No hay notificaciones</p>
                    </motion.div>
                  ) : (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRead={markAsRead}
                        onClear={clearNotification}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

function useTimeAgo(timestamp: number): string {
  const [timeAgo, setTimeAgo] = useState('')

  const updateTimeAgo = useCallback(() => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      setTimeAgo(`hace ${days}d`)
    } else if (hours > 0) {
      setTimeAgo(`hace ${hours}h`)
    } else if (minutes > 0) {
      setTimeAgo(`hace ${minutes}m`)
    } else {
      setTimeAgo('ahora')
    }
  }, [timestamp])

  React.useEffect(() => {
    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000) // Actualizar cada minuto
    return () => clearInterval(interval)
  }, [updateTimeAgo])

  return timeAgo
}
