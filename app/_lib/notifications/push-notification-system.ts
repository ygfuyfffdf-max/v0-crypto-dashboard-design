// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔔 CHRONOS PUSH NOTIFICATION SYSTEM — SUPREME ELEVATION 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de notificaciones push con WebSockets, Service Workers,
 * notificaciones en tiempo real, y gestión inteligente de alertas.
 *
 * @version 1.0.0 - SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { io, Socket } from 'socket.io-client'
import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS Y INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface PushNotification {
  id: string
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  actions?: NotificationAction[]
  data?: Record<string, any>
  timestamp?: number
  priority: 'low' | 'normal' | 'high' | 'critical'
  category: 'sales' | 'inventory' | 'financial' | 'system' | 'ai' | 'reminder'
  userId?: string
  read?: boolean
  delivered?: boolean
  clicked?: boolean
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export interface NotificationPreferences {
  userId: string
  enabled: boolean
  categories: {
    sales: boolean
    inventory: boolean
    financial: boolean
    system: boolean
    ai: boolean
    reminder: boolean
  }
  channels: {
    push: boolean
    email: boolean
    sms: boolean
    inApp: boolean
  }
  quietHours: {
    enabled: boolean
    start: string // HH:MM format
    end: string // HH:MM format
  }
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
}

export interface NotificationMetrics {
  totalSent: number
  totalDelivered: number
  totalClicked: number
  totalRead: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  deliveryRate: number
  clickRate: number
  readRate: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE NOTIFICACIONES PUSH
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class PushNotificationService {
  private static instance: PushNotificationService
  private socket: Socket | null = null
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private notificationQueue: PushNotification[] = []
  private isConnected = false
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelay = 1000
  private notificationCallbacks: Map<string, (notification: PushNotification) => void> = new Map()

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // INICIALIZACIÓN Y CONFIGURACIÓN
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  async initialize(): Promise<void> {
    try {
      logger.info('[PushNotificationService] Inicializando servicio de notificaciones')

      // Verificar soporte del navegador
      if (!this.checkBrowserSupport()) {
        logger.warn('[PushNotificationService] Navegador no soporta notificaciones push')
        return
      }

      // Solicitar permisos
      await this.requestPermissions()

      // Registrar Service Worker
      await this.registerServiceWorker()

      // Conectar WebSocket
      await this.connectWebSocket()

      // Configurar listeners
      this.setupEventListeners()

      logger.info('[PushNotificationService] Servicio inicializado exitosamente')
    } catch (error) {
      logger.error('[PushNotificationService] Error inicializando servicio', error as Error)
      throw error
    }
  }

  private checkBrowserSupport(): boolean {
    const hasNotificationSupport = 'Notification' in window
    const hasServiceWorkerSupport = 'serviceWorker' in navigator
    const hasPushSupport = 'PushManager' in window

    logger.info('[PushNotificationService] Soporte del navegador:', {
      notifications: hasNotificationSupport,
      serviceWorker: hasServiceWorkerSupport,
      push: hasPushSupport
    })

    return hasNotificationSupport && hasServiceWorkerSupport && hasPushSupport
  }

  private async requestPermissions(): Promise<void> {
    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        logger.info(`[PushNotificationService] Permiso de notificación: ${permission}`)
        
        if (permission !== 'granted') {
          throw new Error('Permiso de notificación denegado')
        }
      } else if (Notification.permission === 'denied') {
        throw new Error('Permiso de notificación previamente denegado')
      }
    } catch (error) {
      logger.error('[PushNotificationService] Error solicitando permisos', error as Error)
      throw error
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      if (!navigator.serviceWorker) {
        throw new Error('Service Worker no soportado')
      }

      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js')
      logger.info('[PushNotificationService] Service Worker registrado')

      // Esperar a que el Service Worker esté listo
      await navigator.serviceWorker.ready
      logger.info('[PushNotificationService] Service Worker listo')
    } catch (error) {
      logger.error('[PushNotificationService] Error registrando Service Worker', error as Error)
      throw error
    }
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001', {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        })

        this.socket.on('connect', () => {
          logger.info('[PushNotificationService] WebSocket conectado')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.processNotificationQueue()
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          logger.warn(`[PushNotificationService] WebSocket desconectado: ${reason}`)
          this.isConnected = false
        })

        this.socket.on('reconnect_attempt', (attemptNumber) => {
          logger.info(`[PushNotificationService] Intentando reconexión ${attemptNumber}/${this.maxReconnectAttempts}`)
          this.reconnectAttempts = attemptNumber
        })

        this.socket.on('notification', (notification: PushNotification) => {
          logger.info('[PushNotificationService] Notificación recibida via WebSocket', { id: notification.id })
          this.handleIncomingNotification(notification)
        })

        this.socket.on('connect_error', (error) => {
          logger.error('[PushNotificationService] Error de conexión WebSocket', error)
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Máximo de intentos de reconexión alcanzado'))
          }
        })

      } catch (error) {
        logger.error('[PushNotificationService] Error conectando WebSocket', error as Error)
        reject(error)
      }
    })
  }

  private setupEventListeners(): void {
    // Listener para mensajes del Service Worker
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION_CLICKED') {
          this.handleNotificationClick(event.data.notification)
        }
      })
    }

    // Listener para cuando la app vuelve a primer plano
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.processNotificationQueue()
      }
    })

    // Listener para cambios en la conexión
    window.addEventListener('online', () => {
      logger.info('[PushNotificationService] Conexión restaurada - procesando cola')
      this.processNotificationQueue()
    })

    window.addEventListener('offline', () => {
      logger.warn('[PushNotificationService] Conexión perdida - encolando notificaciones')
    })
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // GESTIÓN DE NOTIFICACIONES
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  async sendNotification(notification: PushNotification): Promise<void> {
    try {
      logger.info('[PushNotificationService] Enviando notificación', { id: notification.id })

      // Validar notificación
      this.validateNotification(notification)

      // Verificar si está en horas de silencio
      if (await this.isInQuietHours(notification)) {
        logger.info('[PushNotificationService] Notificación pospuesta por horas de silencio', { id: notification.id })
        this.queueNotification(notification)
        return
      }

      // Enviar via WebSocket si está conectado
      if (this.isConnected && this.socket) {
        this.socket.emit('send_notification', notification)
      }

      // Mostrar notificación push
      await this.showPushNotification(notification)

      // Enviar via Service Worker si está disponible
      if (this.serviceWorkerRegistration) {
        await this.sendViaServiceWorker(notification)
      }

      // Guardar métricas
      await this.trackNotificationMetrics(notification, 'sent')

      logger.info('[PushNotificationService] Notificación enviada exitosamente', { id: notification.id })
    } catch (error) {
      logger.error('[PushNotificationService] Error enviando notificación', error as Error)
      
      // Encolar para reenvío posterior
      this.queueNotification(notification)
      throw error
    }
  }

  private validateNotification(notification: PushNotification): void {
    if (!notification.id || !notification.title || !notification.body) {
      throw new Error('Notificación inválida: id, title y body son requeridos')
    }

    if (!notification.priority) notification.priority = 'normal'
    if (!notification.category) notification.category = 'system'
    if (!notification.timestamp) notification.timestamp = Date.now()
  }

  private async showPushNotification(notification: PushNotification): Promise<void> {
    if (Notification.permission !== 'granted') {
      logger.warn('[PushNotificationService] Permisos no concedidos para notificaciones push')
      return
    }

    try {
      const pushNotification = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/badge-72x72.png',
        image: notification.image,
        tag: notification.tag || notification.id,
        requireInteraction: notification.requireInteraction || notification.priority === 'critical',
        silent: notification.silent || false,
        vibrate: notification.vibrate || (notification.priority === 'critical' ? [200, 100, 200] : undefined),
        actions: notification.actions || [],
        data: notification.data || {}
      })

      // Manejar eventos de la notificación
      pushNotification.onclick = (event) => {
        this.handleNotificationClick(notification)
      }

      pushNotification.onerror = (error) => {
        logger.error('[PushNotificationService] Error en notificación push', error)
      }

      // Auto-cerrar notificaciones no críticas después de 5 segundos
      if (notification.priority !== 'critical' && !notification.requireInteraction) {
        setTimeout(() => {
          pushNotification.close()
        }, 5000)
      }

      // Trackear métricas
      await this.trackNotificationMetrics(notification, 'delivered')

    } catch (error) {
      logger.error('[PushNotificationService] Error mostrando notificación push', error as Error)
      throw error
    }
  }

  private async sendViaServiceWorker(notification: PushNotification): Promise<void> {
    if (!this.serviceWorkerRegistration || !this.serviceWorkerRegistration.active) {
      return
    }

    try {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        notification: notification
      })
    } catch (error) {
      logger.error('[PushNotificationService] Error enviando via Service Worker', error as Error)
    }
  }

  private handleIncomingNotification(notification: PushNotification): void {
    logger.info('[PushNotificationService] Procesando notificación entrante', { id: notification.id })
    
    // Ejecutar callbacks registrados
    const callback = this.notificationCallbacks.get(notification.category)
    if (callback) {
      callback(notification)
    }

    // Mostrar notificación
    this.showPushNotification(notification).catch(error => {
      logger.error('[PushNotificationService] Error mostrando notificación entrante', error)
    })
  }

  private handleNotificationClick(notification: PushNotification): void {
    logger.info('[PushNotificationService] Notificación clickeada', { id: notification.id })
    
    // Trackear métricas
    this.trackNotificationMetrics(notification, 'clicked').catch(error => {
      logger.error('[PushNotificationService] Error trackeando click', error)
    })

    // Abrir app o navegar a sección relevante
    if (notification.data?.url) {
      window.open(notification.data.url, '_blank')
    } else {
      // Navegar a sección basada en categoría
      this.navigateToRelevantSection(notification.category)
    }

    // Marcar como leída si tiene userId
    if (notification.userId) {
      this.markAsRead(notification.id, notification.userId)
    }
  }

  private navigateToRelevantSection(category: string): void {
    const routes = {
      sales: '/ventas',
      inventory: '/almacen',
      financial: '/bancos',
      system: '/configuracion',
      ai: '/ia',
      reminder: '/dashboard'
    }

    const route = routes[category as keyof typeof routes] || '/dashboard'
    window.location.href = route
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // SISTEMA DE COLAS Y RECONEXIÓN
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  private queueNotification(notification: PushNotification): void {
    logger.info('[PushNotificationService] Encolando notificación', { id: notification.id })
    
    // Evitar duplicados
    const exists = this.notificationQueue.some(n => n.id === notification.id)
    if (!exists) {
      this.notificationQueue.push(notification)
    }

    // Limitar tamaño de la cola
    if (this.notificationQueue.length > 100) {
      this.notificationQueue = this.notificationQueue.slice(-100)
    }

    // Guardar en localStorage para persistencia
    localStorage.setItem('notificationQueue', JSON.stringify(this.notificationQueue))
  }

  private async processNotificationQueue(): Promise<void> {
    if (this.notificationQueue.length === 0) {
      // Intentar cargar desde localStorage
      const stored = localStorage.getItem('notificationQueue')
      if (stored) {
        try {
          this.notificationQueue = JSON.parse(stored)
        } catch (error) {
          logger.error('[PushNotificationService] Error cargando cola desde localStorage', error as Error)
        }
      }
    }

    if (this.notificationQueue.length === 0) return

    logger.info(`[PushNotificationService] Procesando ${this.notificationQueue.length} notificaciones en cola`)

    const queueCopy = [...this.notificationQueue]
    this.notificationQueue = []

    for (const notification of queueCopy) {
      try {
        await this.sendNotification(notification)
      } catch (error) {
        logger.error('[PushNotificationService] Error procesando notificación de cola', error as Error)
        // Re-encolar si falla
        this.queueNotification(notification)
      }
    }

    // Limpiar localStorage
    localStorage.removeItem('notificationQueue')
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // PREFERENCIAS Y CONFIGURACIÓN
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const stored = localStorage.getItem(`notificationPrefs_${userId}`)
      if (stored) {
        return JSON.parse(stored)
      }

      // Preferencias por defecto
      return {
        userId,
        enabled: true,
        categories: {
          sales: true,
          inventory: true,
          financial: true,
          system: true,
          ai: true,
          reminder: true
        },
        channels: {
          push: true,
          email: false,
          sms: false,
          inApp: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        frequency: 'realtime'
      }
    } catch (error) {
      logger.error('[PushNotificationService] Error obteniendo preferencias', error as Error)
      throw error
    }
  }

  async updateNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      localStorage.setItem(`notificationPrefs_${preferences.userId}`, JSON.stringify(preferences))
      logger.info('[PushNotificationService] Preferencias actualizadas', { userId: preferences.userId })
    } catch (error) {
      logger.error('[PushNotificationService] Error actualizando preferencias', error as Error)
      throw error
    }
  }

  private async isInQuietHours(notification: PushNotification): Promise<boolean> {
    try {
      if (!notification.userId) return false

      const preferences = await this.getNotificationPreferences(notification.userId)
      if (!preferences.quietHours.enabled) return false

      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      const [currentHour, currentMinute] = currentTime.split(':').map(Number)
      const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number)
      const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number)

      const currentMinutes = currentHour * 60 + currentMinute
      const startMinutes = startHour * 60 + startMinute
      const endMinutes = endHour * 60 + endMinute

      // Manejar horas que cruzan la medianoche
      if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes
      } else {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes
      }
    } catch (error) {
      logger.error('[PushNotificationService] Error verificando horas de silencio', error as Error)
      return false
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // CALLBACKS Y EVENTOS
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  onNotification(category: string, callback: (notification: PushNotification) => void): void {
    this.notificationCallbacks.set(category, callback)
  }

  offNotification(category: string): void {
    this.notificationCallbacks.delete(category)
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTRICAS Y ANALÍTICAS
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  private async trackNotificationMetrics(notification: PushNotification, event: 'sent' | 'delivered' | 'clicked' | 'read'): Promise<void> {
    try {
      const metrics = {
        notificationId: notification.id,
        userId: notification.userId,
        category: notification.category,
        priority: notification.priority,
        event,
        timestamp: Date.now()
      }

      // Enviar a analytics (en producción usaría un servicio como Google Analytics)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'notification_interaction', metrics)
      }

      // Guardar en localStorage para análisis local
      const metricsKey = `notificationMetrics_${new Date().toISOString().split('T')[0]}`
      const existingMetrics = JSON.parse(localStorage.getItem(metricsKey) || '[]')
      existingMetrics.push(metrics)
      localStorage.setItem(metricsKey, JSON.stringify(existingMetrics))

      // Actualizar contadores
      const counters = JSON.parse(localStorage.getItem('notificationCounters') || '{}')
      counters[event] = (counters[event] || 0) + 1
      localStorage.setItem('notificationCounters', JSON.stringify(counters))

    } catch (error) {
      logger.error('[PushNotificationService] Error trackeando métricas', error as Error)
    }
  }

  async getNotificationMetrics(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<NotificationMetrics> {
    try {
      const now = new Date()
      const startDate = new Date()
      
      switch (timeframe) {
        case 'day':
          startDate.setDate(now.getDate() - 1)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
      }

      const counters = JSON.parse(localStorage.getItem('notificationCounters') || '{}')
      const totalSent = counters.sent || 0
      const totalDelivered = counters.delivered || 0
      const totalClicked = counters.clicked || 0
      const totalRead = counters.read || 0

      return {
        totalSent,
        totalDelivered,
        totalClicked,
        totalRead,
        byCategory: {}, // En producción, analizaría los datos guardados
        byPriority: {}, // En producción, analizaría los datos guardados
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        clickRate: totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0,
        readRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0
      }
    } catch (error) {
      logger.error('[PushNotificationService] Error obteniendo métricas', error as Error)
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalClicked: 0,
        totalRead: 0,
        byCategory: {},
        byPriority: {},
        deliveryRate: 0,
        clickRate: 0,
        readRate: 0
      }
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      // En producción, esto actualizaría la base de datos
      logger.info('[PushNotificationService] Marcando notificación como leída', { notificationId, userId })
      
      // Trackear evento
      await this.trackNotificationMetrics({ id: notificationId, userId } as PushNotification, 'read')
    } catch (error) {
      logger.error('[PushNotificationService] Error marcando como leída', error as Error)
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES Y HELPERS
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  createNotification(
    title: string,
    body: string,
    options: Partial<PushNotification> = {}
  ): PushNotification {
    return {
      id: this.generateNotificationId(),
      title,
      body,
      priority: options.priority || 'normal',
      category: options.category || 'system',
      timestamp: Date.now(),
      read: false,
      delivered: false,
      clicked: false,
      ...options
    }
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS DE LIMPIEZA
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  async cleanup(): Promise<void> {
    logger.info('[PushNotificationService] Limpiando servicio')
    
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    this.notificationQueue = []
    this.notificationCallbacks.clear()
    this.isConnected = false
    this.reconnectAttempts = 0
    
    localStorage.removeItem('notificationQueue')
    
    logger.info('[PushNotificationService] Servicio limpiado')
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SISTEMA DE NOTIFICACIONES INTELIGENTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class SmartNotificationSystem {
  private pushService: PushNotificationService
  private notificationHistory: Map<string, number> = new Map()
  private readonly maxNotificationsPerHour = 10
  private readonly maxNotificationsPerDay = 50

  constructor() {
    this.pushService = PushNotificationService.getInstance()
  }

  async initialize(): Promise<void> {
    await this.pushService.initialize()
    this.setupSmartCallbacks()
  }

  private setupSmartCallbacks(): void {
    // Callback para notificaciones de ventas
    this.pushService.onNotification('sales', (notification) => {
      this.handleSmartSalesNotification(notification)
    })

    // Callback para notificaciones de inventario
    this.pushService.onNotification('inventory', (notification) => {
      this.handleSmartInventoryNotification(notification)
    })

    // Callback para notificaciones de IA
    this.pushService.onNotification('ai', (notification) => {
      this.handleSmartAINotification(notification)
    })
  }

  private async handleSmartSalesNotification(notification: PushNotification): Promise<void> {
    // Implementar lógica inteligente para notificaciones de ventas
    // Por ejemplo: no notificar durante horas pico de ventas a menos que sea crítico
    const currentHour = new Date().getHours()
    
    if (notification.priority === 'critical' || (currentHour >= 9 && currentHour <= 18)) {
      await this.pushService.sendNotification(notification)
    } else {
      // Programar para más tarde
      setTimeout(() => {
        this.pushService.sendNotification(notification)
      }, 1000 * 60 * 30) // 30 minutos
    }
  }

  private async handleSmartInventoryNotification(notification: PushNotification): Promise<void> {
    // Implementar lógica inteligente para notificaciones de inventario
    // Por ejemplo: agrupar múltiples notificaciones de inventario
    const recentInventoryNotifications = this.getRecentNotifications('inventory', 60) // última hora
    
    if (recentInventoryNotifications.length > 3) {
      // Crear notificación agrupada
      const groupedNotification = this.pushService.createNotification(
        'Múltiples Productos Requieren Atención',
        `${recentInventoryNotifications.length} productos necesitan reabastecimiento`,
        {
          category: 'inventory',
          priority: 'high',
          actions: [
            { action: 'view-all', title: 'Ver Todos' },
            { action: 'create-order', title: 'Crear Orden' }
          ]
        }
      )
      
      await this.pushService.sendNotification(groupedNotification)
    } else {
      await this.pushService.sendNotification(notification)
    }
  }

  private async handleSmartAINotification(notification: PushNotification): Promise<void> {
    // Implementar lógica inteligente para notificaciones de IA
    // Por ejemplo: solo notificar insights de alta confianza o alta importancia
    if (notification.priority === 'high' || notification.priority === 'critical') {
      await this.pushService.sendNotification(notification)
    }
  }

  private getRecentNotifications(category: string, minutes: number): PushNotification[] {
    // En producción, esto consultaría la base de datos
    const now = Date.now()
    const cutoff = now - (minutes * 60 * 1000)
    
    // Implementar lógica para obtener notificaciones recientes
    return []
  }

  async shouldSendNotification(notification: PushNotification, userId: string): Promise<boolean> {
    // Verificar límites de frecuencia
    const key = `${userId}_${notification.category}`
    const now = Date.now()
    const hourAgo = now - (60 * 60 * 1000)
    const dayAgo = now - (24 * 60 * 60 * 1000)

    // Contar notificaciones recientes
    const recentNotifications = Array.from(this.notificationHistory.entries())
      .filter(([k, timestamp]) => k.startsWith(key) && timestamp > hourAgo)
    
    const dailyNotifications = Array.from(this.notificationHistory.entries())
      .filter(([k, timestamp]) => k.startsWith(userId) && timestamp > dayAgo)

    if (recentNotifications.length >= 5) {
      logger.info('[SmartNotificationSystem] Notificación bloqueada por límite por hora', { userId, category: notification.category })
      return false
    }

    if (dailyNotifications.length >= this.maxNotificationsPerDay) {
      logger.info('[SmartNotificationSystem] Notificación bloqueada por límite diario', { userId })
      return false
    }

    // Registrar esta notificación
    this.notificationHistory.set(`${key}_${now}`, now)
    
    // Limpiar historial antiguo
    this.cleanupNotificationHistory()
    
    return true
  }

  private cleanupNotificationHistory(): void {
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000)
    
    for (const [key, timestamp] of this.notificationHistory.entries()) {
      if (timestamp < dayAgo) {
        this.notificationHistory.delete(key)
      }
    }
  }

  async sendSmartNotification(notification: PushNotification, userId: string): Promise<void> {
    if (await this.shouldSendNotification(notification, userId)) {
      await this.pushService.sendNotification(notification)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN DEL SISTEMA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const NotificationSystem = {
  PushNotificationService,
  SmartNotificationSystem
}

export default PushNotificationService