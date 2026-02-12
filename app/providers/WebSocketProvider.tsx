/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔌 CHRONOS INFINITY 2026 — WEBSOCKET PROVIDER
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Provider de React para WebSocket Service
 * - Inicialización automática
 * - Configuración desde environment
 * - Acceso global via context
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  WebSocketStatus,
  createWebSocketService,
  type WebSocketService,
} from '@/app/lib/services/websocket-service'

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface WebSocketContextValue {
  service: WebSocketService | null
  status: WebSocketStatus
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextValue>({
  service: null,
  status: WebSocketStatus.DISCONNECTED,
  isConnected: false,
})

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════

interface WebSocketProviderProps {
  children: React.ReactNode
  url?: string
  authToken?: string
  autoConnect?: boolean
}

export function WebSocketProvider({
  children,
  url = process.env.NEXT_PUBLIC_WS_URL || (typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws` : 'ws://localhost:3001'),
  authToken,
  autoConnect = true,
}: WebSocketProviderProps) {
  const [status, setStatus] = useState<WebSocketStatus>(WebSocketStatus.DISCONNECTED)
  const serviceRef = useRef<WebSocketService | null>(null)

  // Crear servicio una sola vez
  if (!serviceRef.current) {
    serviceRef.current = createWebSocketService({
      url,
      authToken,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      enableCompression: true,
      enableMetrics: true,
    })
  }

  useEffect(() => {
    const service = serviceRef.current
    if (!service) return

    const handleStatus = (newStatus: WebSocketStatus) => {
      setStatus(newStatus)
    }

    service.on('status', handleStatus)

    // Auto-connect
    if (autoConnect) {
      service.connect().catch((error) => {
        console.error('[WebSocketProvider] Connection error:', error)
      })
    }

    return () => {
      service.off('status', handleStatus)
      // No desconectamos aquí para mantener la conexión durante hot reload
    }
  }, [autoConnect])

  const value = useMemo(
    () => ({
      service: serviceRef.current,
      status,
      isConnected: status === WebSocketStatus.CONNECTED,
    }),
    [status]
  )

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider')
  }
  
  return context
}
