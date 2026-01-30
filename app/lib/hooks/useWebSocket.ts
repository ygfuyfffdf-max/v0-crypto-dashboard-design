/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎣 CHRONOS INFINITY 2026 — WEBSOCKET REACT HOOK
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Hook de React para integración elegante con WebSocket Service
 * - Auto-suscripción y limpieza
 * - Estado reactivo
 * - TypeScript completo
 * - Optimizado para re-renders
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  WebSocketEventType,
  WebSocketMessage,
  WebSocketStatus,
  getWebSocketService,
  type ConnectionMetrics,
} from '@/app/lib/services/websocket-service'

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useWebSocket
// ═══════════════════════════════════════════════════════════════════════════════════════

interface UseWebSocketOptions {
  autoConnect?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options

  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.DISCONNECTED)
  const [metrics, setMetrics] = useState<ConnectionMetrics | null>(null)
  const wsRef = useRef(getWebSocketService())
  const handlersRef = useRef({ onConnect, onDisconnect, onError })

  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    handlersRef.current = { onConnect, onDisconnect, onError }
  }, [onConnect, onDisconnect, onError])

  useEffect(() => {
    const ws = wsRef.current

    const handleStatus = (newStatus: WebSocketStatus) => {
      setStatus(newStatus)
      
      if (newStatus === WebSocketStatus.CONNECTED) {
        handlersRef.current.onConnect?.()
        setMetrics(ws.getMetrics())
      } else if (newStatus === WebSocketStatus.DISCONNECTED) {
        handlersRef.current.onDisconnect?.()
      }
    }

    const handleError = (error: any) => {
      handlersRef.current.onError?.(error)
    }

    ws.on('status', handleStatus)
    ws.on('error', handleError)

    // Auto-connect si está habilitado
    if (autoConnect && !ws.isConnected()) {
      ws.connect().catch(handleError)
    }

    // Actualizar métricas periódicamente
    const metricsInterval = setInterval(() => {
      if (ws.isConnected()) {
        setMetrics(ws.getMetrics())
      }
    }, 5000)

    return () => {
      ws.off('status', handleStatus)
      ws.off('error', handleError)
      clearInterval(metricsInterval)
    }
  }, [autoConnect])

  const connect = useCallback(async () => {
    try {
      await wsRef.current.connect()
    } catch (error) {
      console.error('[useWebSocket] Connection error:', error)
      throw error
    }
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current.disconnect()
  }, [])

  const send = useCallback(<T = any>(
    type: WebSocketEventType,
    data: T,
    priority?: WebSocketMessage['priority']
  ) => {
    return wsRef.current.send(type, data, priority)
  }, [])

  return {
    status,
    metrics,
    isConnected: status === WebSocketStatus.CONNECTED,
    isConnecting: status === WebSocketStatus.CONNECTING,
    isReconnecting: status === WebSocketStatus.RECONNECTING,
    connect,
    disconnect,
    send,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useWebSocketEvent
// ═══════════════════════════════════════════════════════════════════════════════════════

interface UseWebSocketEventOptions<T = any> {
  enabled?: boolean
  onMessage?: (data: T) => void
}

export function useWebSocketEvent<T = any>(
  eventType: WebSocketEventType,
  handler: (data: T) => void,
  options: UseWebSocketEventOptions<T> = {}
) {
  const { enabled = true, onMessage } = options
  const handlerRef = useRef(handler)
  const wsRef = useRef(getWebSocketService())

  // Actualizar ref cuando cambie el handler
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    const ws = wsRef.current

    const handleMessage = (data: T) => {
      handlerRef.current(data)
      onMessage?.(data)
    }

    ws.on(eventType, handleMessage)

    return () => {
      ws.off(eventType, handleMessage)
    }
  }, [eventType, enabled, onMessage])
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useWebSocketNotifications
// ═══════════════════════════════════════════════════════════════════════════════════════

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
}

export function useWebSocketNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useWebSocketEvent(WebSocketEventType.NOTIFICATION, (data: any) => {
    const notification: Notification = {
      id: data.id || `notif_${Date.now()}`,
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      timestamp: data.timestamp || Date.now(),
      read: false,
    }

    setNotifications((prev) => [notification, ...prev])
    setUnreadCount((prev) => prev + 1)
  })

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    setUnreadCount(0)
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useWebSocketAuditLog
// ═══════════════════════════════════════════════════════════════════════════════════════

interface AuditLogEntry {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: number
  metadata?: Record<string, any>
}

export function useWebSocketAuditLog(limit: number = 100) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])

  useWebSocketEvent(WebSocketEventType.AUDIT_LOG, (data: AuditLogEntry) => {
    setLogs((prev) => {
      const newLogs = [data, ...prev]
      return newLogs.slice(0, limit)
    })
  })

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    logs,
    clearLogs,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK: useWebSocketMarketData
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MarketUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
}

export function useWebSocketMarketData(symbols: string[] = []) {
  const [marketData, setMarketData] = useState<Map<string, MarketUpdate>>(new Map())

  useWebSocketEvent(
    WebSocketEventType.MARKET_UPDATE,
    (data: MarketUpdate) => {
      if (symbols.length === 0 || symbols.includes(data.symbol)) {
        setMarketData((prev) => {
          const next = new Map(prev)
          next.set(data.symbol, data)
          return next
        })
      }
    }
  )

  useWebSocketEvent(
    WebSocketEventType.PRICE_CHANGE,
    (data: MarketUpdate) => {
      if (symbols.length === 0 || symbols.includes(data.symbol)) {
        setMarketData((prev) => {
          const next = new Map(prev)
          const existing = next.get(data.symbol)
          next.set(data.symbol, {
            ...existing,
            ...data,
          } as MarketUpdate)
          return next
        })
      }
    }
  )

  const getPrice = useCallback((symbol: string): number | null => {
    return marketData.get(symbol)?.price ?? null
  }, [marketData])

  return {
    marketData: Array.from(marketData.values()),
    getPrice,
  }
}
