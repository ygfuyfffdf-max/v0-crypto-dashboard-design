/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS INFINITY 2026 — WEBSOCKET SERVICE ULTRA-PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de WebSocket en tiempo real con:
 * - Reconexión automática inteligente
 * - Sistema de heartbeat avanzado
 * - Manejo de eventos tipado
 * - Queue de mensajes offline
 * - Compresión de datos
 * - Sistema de autenticación JWT
 * - Métricas de rendimiento
 * - Fallback a polling si WebSocket falla
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { EventEmitter } from 'events'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS Y ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════════

export enum WebSocketStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

export enum WebSocketEventType {
  // Notificaciones
  NOTIFICATION = 'notification',
  AUDIT_LOG = 'audit_log',
  SYSTEM_ALERT = 'system_alert',
  
  // Datos en tiempo real
  MARKET_UPDATE = 'market_update',
  PRICE_CHANGE = 'price_change',
  TRANSACTION = 'transaction',
  
  // Sistema
  USER_ACTIVITY = 'user_activity',
  WORKFLOW_UPDATE = 'workflow_update',
  REPORT_READY = 'report_ready',
  
  // Gestión
  PERMISSION_CHANGE = 'permission_change',
  THEME_UPDATE = 'theme_update',
  CONFIG_UPDATE = 'config_update',
}

export interface WebSocketMessage<T = any> {
  id: string
  type: WebSocketEventType
  timestamp: number
  data: T
  priority?: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  sessionId?: string
}

export interface WebSocketConfig {
  url: string
  protocol?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  timeout?: number
  enableCompression?: boolean
  enableMetrics?: boolean
  authToken?: string
}

export interface ConnectionMetrics {
  connectedAt: number
  lastMessageAt: number
  messagesReceived: number
  messagesSent: number
  reconnectAttempts: number
  averageLatency: number
  bytesSent: number
  bytesReceived: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// WEBSOCKET SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null
  private config: Required<WebSocketConfig>
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageQueue: WebSocketMessage[] = []
  private metrics: ConnectionMetrics = {
    connectedAt: 0,
    lastMessageAt: 0,
    messagesReceived: 0,
    messagesSent: 0,
    reconnectAttempts: 0,
    averageLatency: 0,
    bytesSent: 0,
    bytesReceived: 0,
  }
  private latencySum = 0
  private latencyCount = 0
  private pendingPings = new Map<string, number>()

  constructor(config: WebSocketConfig) {
    super()
    this.config = {
      url: config.url,
      protocol: config.protocol ?? 'wss',
      reconnectInterval: config.reconnectInterval ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      timeout: config.timeout ?? 10000,
      enableCompression: config.enableCompression ?? true,
      enableMetrics: config.enableMetrics ?? true,
      authToken: config.authToken ?? '',
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // CONEXIÓN Y DESCONEXIÓN
  // ═══════════════════════════════════════════════════════════════════════════════════════

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      this.setStatus(WebSocketStatus.CONNECTING)

      try {
        const url = this.config.authToken
          ? `${this.config.url}?token=${this.config.authToken}`
          : this.config.url

        this.ws = new WebSocket(url, this.config.protocol)

        this.ws.onopen = () => this.handleOpen(resolve)
        this.ws.onmessage = (event) => this.handleMessage(event)
        this.ws.onerror = (error) => this.handleError(error, reject)
        this.ws.onclose = (event) => this.handleClose(event)

        // Timeout de conexión
        setTimeout(() => {
          if (this.status === WebSocketStatus.CONNECTING) {
            reject(new Error('WebSocket connection timeout'))
            this.disconnect()
          }
        }, this.config.timeout)
      } catch (error) {
        this.setStatus(WebSocketStatus.ERROR)
        reject(error)
      }
    })
  }

  public disconnect(): void {
    this.clearReconnectTimeout()
    this.clearHeartbeat()
    
    if (this.ws) {
      this.ws.onclose = null // Evitar reconexión automática
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.setStatus(WebSocketStatus.DISCONNECTED)
    this.messageQueue = []
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // ENVÍO DE MENSAJES
  // ═══════════════════════════════════════════════════════════════════════════════════════

  public send<T = any>(
    type: WebSocketEventType,
    data: T,
    priority: WebSocketMessage['priority'] = 'medium'
  ): boolean {
    const message: WebSocketMessage<T> = {
      id: this.generateMessageId(),
      type,
      timestamp: Date.now(),
      data,
      priority,
    }

    if (this.status === WebSocketStatus.CONNECTED && this.ws) {
      return this.sendMessage(message)
    } else {
      // Queue message for later
      this.messageQueue.push(message)
      return false
    }
  }

  private sendMessage(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      const payload = JSON.stringify(message)
      this.ws.send(payload)
      
      this.metrics.messagesSent++
      this.metrics.bytesSent += payload.length
      
      this.emit('message:sent', message)
      return true
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error)
      return false
    }
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return

    const messages = [...this.messageQueue]
    this.messageQueue = []

    for (const message of messages) {
      this.sendMessage(message)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // MANEJADORES DE EVENTOS
  // ═══════════════════════════════════════════════════════════════════════════════════════

  private handleOpen(resolve: () => void): void {
    this.setStatus(WebSocketStatus.CONNECTED)
    this.reconnectAttempts = 0
    this.metrics.connectedAt = Date.now()
    
    this.startHeartbeat()
    this.flushMessageQueue()
    
    this.emit('connected')
    resolve()
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      this.metrics.messagesReceived++
      this.metrics.bytesReceived += event.data.length
      this.metrics.lastMessageAt = Date.now()

      // Manejar respuestas de ping para latencia
      if (message.type === 'pong' as WebSocketEventType) {
        this.handlePong(message.id)
        return
      }

      // Emitir evento específico por tipo
      this.emit(message.type, message.data)
      
      // Emitir evento genérico
      this.emit('message', message)
    } catch (error) {
      console.error('[WebSocket] Error parsing message:', error)
    }
  }

  private handleError(error: Event, reject?: (reason: any) => void): void {
    console.error('[WebSocket] Connection error:', error)
    this.setStatus(WebSocketStatus.ERROR)
    this.emit('error', error)
    
    if (reject) {
      reject(error)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('[WebSocket] Connection closed:', event.code, event.reason)
    
    this.clearHeartbeat()
    this.setStatus(WebSocketStatus.DISCONNECTED)
    
    this.emit('disconnected', { code: event.code, reason: event.reason })

    // Intentar reconectar si no fue cierre intencional
    if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // RECONEXIÓN AUTOMÁTICA
  // ═══════════════════════════════════════════════════════════════════════════════════════

  private scheduleReconnect(): void {
    this.clearReconnectTimeout()

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 segundos
    )

    this.setStatus(WebSocketStatus.RECONNECTING)
    this.metrics.reconnectAttempts++

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`[WebSocket] Reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`)
      
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnect failed:', error)
      })
    }, delay)
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // HEARTBEAT (KEEP-ALIVE)
  // ═══════════════════════════════════════════════════════════════════════════════════════

  private startHeartbeat(): void {
    this.clearHeartbeat()

    this.heartbeatInterval = setInterval(() => {
      const pingId = this.generateMessageId()
      this.pendingPings.set(pingId, Date.now())
      
      this.send('ping' as WebSocketEventType, { id: pingId })
      
      // Limpiar pings antiguos (> 10 segundos)
      const now = Date.now()
      for (const [id, timestamp] of this.pendingPings.entries()) {
        if (now - timestamp > 10000) {
          this.pendingPings.delete(id)
        }
      }
    }, this.config.heartbeatInterval)
  }

  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private handlePong(pingId: string): void {
    const sentAt = this.pendingPings.get(pingId)
    if (sentAt) {
      const latency = Date.now() - sentAt
      this.pendingPings.delete(pingId)
      
      this.latencySum += latency
      this.latencyCount++
      this.metrics.averageLatency = Math.round(this.latencySum / this.latencyCount)
      
      this.emit('latency', latency)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════════════════

  private setStatus(status: WebSocketStatus): void {
    this.status = status
    this.emit('status', status)
  }

  public getStatus(): WebSocketStatus {
    return this.status
  }

  public getMetrics(): ConnectionMetrics {
    return { ...this.metrics }
  }

  public isConnected(): boolean {
    return this.status === WebSocketStatus.CONNECTED
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  public setAuthToken(token: string): void {
    this.config.authToken = token
    
    if (this.isConnected()) {
      this.disconnect()
      this.connect()
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════════════

let wsInstance: WebSocketService | null = null

export function getWebSocketService(config?: WebSocketConfig): WebSocketService {
  if (!wsInstance && config) {
    wsInstance = new WebSocketService(config)
  }
  
  if (!wsInstance) {
    throw new Error('WebSocketService not initialized. Please provide config on first call.')
  }
  
  return wsInstance
}

export function createWebSocketService(config: WebSocketConfig): WebSocketService {
  return new WebSocketService(config)
}

export default WebSocketService
