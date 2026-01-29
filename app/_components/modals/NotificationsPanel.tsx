'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔔 NOTIFICATIONS PANEL — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Panel de notificaciones premium con animaciones y funcionalidad completa
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  Info,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'venta' | 'cliente' | 'banco'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
  anchorRef?: React.RefObject<HTMLButtonElement | null>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NOTIFICATION ICON CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const notificationConfig: Record<
  NotificationType,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  info: {
    icon: <Info size={16} />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  success: {
    icon: <CheckCircle size={16} />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  error: {
    icon: <AlertTriangle size={16} />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  venta: {
    icon: <ShoppingCart size={16} />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  cliente: {
    icon: <Users size={16} />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  banco: {
    icon: <Wallet size={16} />,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOCK NOTIFICATIONS (serán reemplazadas por datos reales)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'venta',
    title: 'Nueva venta registrada',
    message: 'Venta de $7,500 completada para Cliente Demo',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    read: false,
    action: { label: 'Ver venta', href: '/ventas' },
  },
  {
    id: '2',
    type: 'warning',
    title: 'Stock bajo',
    message: "El producto 'Artículo Premium' tiene stock bajo (5 unidades)",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    action: { label: 'Ver almacén', href: '/almacen' },
  },
  {
    id: '3',
    type: 'banco',
    title: 'Transferencia completada',
    message: 'Se transfirieron $2,000 de Bóveda Monte a Profit',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    action: { label: 'Ver bancos', href: '/bancos' },
  },
  {
    id: '4',
    type: 'cliente',
    title: 'Nuevo cliente registrado',
    message: "Se ha registrado el cliente 'Empresa ABC'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
  },
  {
    id: '5',
    type: 'success',
    title: 'Meta del mes alcanzada',
    message: '¡Felicitaciones! Has alcanzado el 100% de tu meta de ventas',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORMAT TIME AGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NOTIFICATION ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onAction,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
  onAction?: (notification: Notification) => void
}) {
  const config = notificationConfig[notification.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        'group relative rounded-xl border p-4 transition-all hover:bg-white/5',
        notification.read ? 'border-white/5 bg-white/[0.02]' : 'border-white/10 bg-white/[0.05]',
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-4 left-0 h-2 w-2 -translate-x-1/2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', config.bgColor)}>
          <span className={config.color}>{config.icon}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h4
              className={cn(
                'text-sm font-medium',
                notification.read ? 'text-white/70' : 'text-white',
              )}
            >
              {notification.title}
            </h4>
            <span className="shrink-0 text-xs text-white/40">
              {formatTimeAgo(notification.timestamp)}
            </span>
          </div>

          <p className="mb-2 text-xs text-white/50">{notification.message}</p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {notification.action && (
              <button
                onClick={() => onAction?.(notification)}
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                  config.bgColor,
                  config.color,
                  'hover:opacity-80',
                )}
              >
                {notification.action.label}
              </button>
            )}

            {/* Mark read / Delete buttons */}
            <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {!notification.read && (
                <button
                  onClick={() => onMarkRead(notification.id)}
                  className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-emerald-400"
                  title="Marcar como leída"
                >
                  <Check size={14} />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
    return undefined
  }, [isOpen, onClose])

  // Filtered notifications
  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  const unreadCount = notifications.filter((n) => !n.read).length

  // Handlers
  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const handleClearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const handleAction = useCallback(
    (notification: Notification) => {
      if (notification.action?.href) {
        // Navegar y cerrar panel
        window.location.href = notification.action.href
        onClose()
      } else if (notification.action?.onClick) {
        notification.action.onClick()
      }
      // Marcar como leída
      handleMarkRead(notification.id)
    },
    [onClose, handleMarkRead],
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed top-16 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-violet-400" />
                <h3 className="font-semibold text-white">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
              <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
                {(['all', 'unread'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs font-medium transition-all',
                      filter === f
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'text-white/50 hover:text-white',
                    )}
                  >
                    {f === 'all' ? 'Todas' : 'Sin leer'}
                  </button>
                ))}
              </div>

              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Check size={12} />
                    Marcar todas
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDelete}
                      onAction={handleAction}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <Bell size={40} className="mx-auto mb-3 text-white/20" />
                    <p className="text-sm text-white/40">
                      {filter === 'unread'
                        ? 'No tienes notificaciones sin leer'
                        : 'No hay notificaciones'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/5 p-3">
                <button
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <TrendingUp size={14} />
                  Ver historial completo
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NotificationsPanel
