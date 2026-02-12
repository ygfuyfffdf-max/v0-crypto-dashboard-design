/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔔 CHRONOS USE PUSH NOTIFICATIONS HOOK — SUPREME ELEVATION 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook React para integrar notificaciones push con el sistema CHRONOS.
 * Incluye inicialización automática, gestión de permisos y notificaciones inteligentes.
 *
 * @version 1.0.0 - SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { PushNotificationService, SmartNotificationSystem, PushNotification, NotificationPreferences } from '@/app/_lib/notifications/push-notification-system'
import { logger } from '@/app/lib/utils/logger'
import { useAuth } from './useAuth'

interface UsePushNotificationsOptions {
  autoInitialize?: boolean
  enableSmartNotifications?: boolean
  categories?: string[]
}

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission
  isInitialized: boolean
  isConnected: boolean
  notifications: PushNotification[]
  preferences: NotificationPreferences | null
  metrics: any
  
  // Métodos
  initialize: () => Promise<void>
  requestPermission: () => Promise<NotificationPermission>
  sendNotification: (notification: PushNotification) => Promise<void>
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>
  getMetrics: (timeframe?: 'day' | 'week' | 'month') => Promise<any>
  markAsRead: (notificationId: string) => Promise<void>
  cleanup: () => Promise<void>
}

export function usePushNotifications(options: UsePushNotificationsOptions = {}): UsePushNotificationsReturn {
  const { 
    autoInitialize = true, 
    enableSmartNotifications = true,
    categories = ['sales', 'inventory', 'financial', 'system', 'ai', 'reminder']
  } = options

  const { user } = useAuth()
  const pushServiceRef = useRef<PushNotificationService | null>(null)
  const smartNotificationSystemRef = useRef<SmartNotificationSystem | null>(null)
  
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [metrics, setMetrics] = useState<any>(null)

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  const checkBrowserSupport = useCallback(() => {
    const hasNotificationSupport = 'Notification' in window
    const hasServiceWorkerSupport = 'serviceWorker' in navigator
    const hasPushSupport = 'PushManager' in window
    
    const supported = hasNotificationSupport && hasServiceWorkerSupport && hasPushSupport
    setIsSupported(supported)
    
    logger.info('[usePushNotifications] Soporte del navegador:', {
      notifications: hasNotificationSupport,
      serviceWorker: hasServiceWorkerSupport,
      push: hasPushSupport,
      overall: supported
    })
    
    return supported
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      if (!isSupported) {
        logger.warn('[usePushNotifications] Notificaciones no soportadas por el navegador')
        return 'denied'
      }

      if (Notification.permission === 'granted') {
        setPermission('granted')
        return 'granted'
      }

      if (Notification.permission === 'denied') {
        setPermission('denied')
        return 'denied'
      }

      // Solicitar permiso
      const result = await Notification.requestPermission()
      setPermission(result)
      
      logger.info(`[usePushNotifications] Permiso de notificación: ${result}`)
      return result

    } catch (error) {
      logger.error('[usePushNotifications] Error solicitando permisos', error as Error)
      setPermission('denied')
      return 'denied'
    }
  }, [isSupported])

  const initialize = useCallback(async () => {
    try {
      if (isInitialized) {
        logger.info('[usePushNotifications] Sistema ya inicializado')
        return
      }

      logger.info('[usePushNotifications] Inicializando sistema de notificaciones')

      // Verificar soporte
      if (!checkBrowserSupport()) {
        logger.warn('[usePushNotifications] Navegador no soporta notificaciones push')
        return
      }

      // Obtener permisos actuales
      const currentPermission = Notification.permission
      setPermission(currentPermission)

      if (currentPermission !== 'granted') {
        logger.warn('[usePushNotifications] Permisos no concedidos')
        return
      }

      // Inicializar servicios
      pushServiceRef.current = PushNotificationService.getInstance()
      
      if (enableSmartNotifications) {
        smartNotificationSystemRef.current = new SmartNotificationSystem()
        await smartNotificationSystemRef.current.initialize()
      } else {
        await pushServiceRef.current.initialize()
      }

      // Cargar preferencias del usuario
      if (user?.id) {
        const userPreferences = await pushServiceRef.current.getNotificationPreferences(user.id)
        setPreferences(userPreferences)
      }

      // Configurar listeners
      setupNotificationListeners()

      setIsInitialized(true)
      setIsConnected(true)
      
      logger.info('[usePushNotifications] Sistema de notificaciones inicializado exitosamente')

    } catch (error) {
      logger.error('[usePushNotifications] Error inicializando sistema', error as Error)
      setIsConnected(false)
      throw error
    }
  }, [checkBrowserSupport, enableSmartNotifications, user, isInitialized])

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // LISTENERS Y CALLBACKS
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  const setupNotificationListeners = useCallback(() => {
    if (!pushServiceRef.current) return

    // Listener para notificaciones de ventas
    pushServiceRef.current.onNotification('sales', (notification) => {
      logger.info('[usePushNotifications] Notificación de ventas recibida', { id: notification.id })
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Mantener últimas 50
    })

    // Listener para notificaciones de inventario
    pushServiceRef.current.onNotification('inventory', (notification) => {
      logger.info('[usePushNotifications] Notificación de inventario recibida', { id: notification.id })
      setNotifications(prev => [notification, ...prev.slice(0, 49)])
    })

    // Listener para notificaciones de IA
    pushServiceRef.current.onNotification('ai', (notification) => {
      logger.info('[usePushNotifications] Notificación de IA recibida', { id: notification.id })
      setNotifications(prev => [notification, ...prev.slice(0, 49)])
    })

    // Listener para notificaciones financieras
    pushServiceRef.current.onNotification('financial', (notification) => {
      logger.info('[usePushNotifications] Notificación financiera recibida', { id: notification.id })
      setNotifications(prev => [notification, ...prev.slice(0, 49)])
    })

    // Listener para notificaciones del sistema
    pushServiceRef.current.onNotification('system', (notification) => {
      logger.info('[usePushNotifications] Notificación del sistema recibida', { id: notification.id })
      setNotifications(prev => [notification, ...prev.slice(0, 49)])
    })

    // Listener para recordatorios
    pushServiceRef.current.onNotification('reminder', (notification) => {
      logger.info('[usePushNotifications] Recordatorio recibido', { id: notification.id })
      setNotifications(prev => [notification, ...prev.slice(0, 49)])
    })
  }, [])

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS DE OPERACIÓN
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  const sendNotification = useCallback(async (notification: PushNotification): Promise<void> => {
    try {
      if (!pushServiceRef.current) {
        throw new Error('Servicio de notificaciones no inicializado')
      }

      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }

      // Agregar userId a la notificación
      const notificationWithUser = {
        ...notification,
        userId: user.id
      }

      await pushServiceRef.current.sendNotification(notificationWithUser)
      
      logger.info('[usePushNotifications] Notificación enviada', { id: notification.id })

    } catch (error) {
      logger.error('[usePushNotifications] Error enviando notificación', error as Error)
      throw error
    }
  }, [user])

  const updatePreferences = useCallback(async (newPreferences: NotificationPreferences): Promise<void> => {
    try {
      if (!pushServiceRef.current) {
        throw new Error('Servicio de notificaciones no inicializado')
      }

      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }

      const preferencesWithUser = {
        ...newPreferences,
        userId: user.id
      }

      await pushServiceRef.current.updateNotificationPreferences(preferencesWithUser)
      setPreferences(preferencesWithUser)
      
      logger.info('[usePushNotifications] Preferencias actualizadas', { userId: user.id })

    } catch (error) {
      logger.error('[usePushNotifications] Error actualizando preferencias', error as Error)
      throw error
    }
  }, [user])

  const getMetrics = useCallback(async (timeframe: 'day' | 'week' | 'month' = 'day'): Promise<any> => {
    try {
      if (!pushServiceRef.current) {
        throw new Error('Servicio de notificaciones no inicializado')
      }

      const metrics = await pushServiceRef.current.getNotificationMetrics(timeframe)
      setMetrics(metrics)
      
      return metrics

    } catch (error) {
      logger.error('[usePushNotifications] Error obteniendo métricas', error as Error)
      throw error
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      if (!pushServiceRef.current) {
        throw new Error('Servicio de notificaciones no inicializado')
      }

      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }

      await pushServiceRef.current.markAsRead(notificationId, user.id)
      
      // Actualizar lista local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )

      logger.info('[usePushNotifications] Notificación marcada como leída', { notificationId })

    } catch (error) {
      logger.error('[usePushNotifications] Error marcando notificación como leída', error as Error)
      throw error
    }
  }, [user])

  const cleanup = useCallback(async () => {
    try {
      if (pushServiceRef.current) {
        await pushServiceRef.current.cleanup()
      }

      pushServiceRef.current = null
      smartNotificationSystemRef.current = null
      
      setIsInitialized(false)
      setIsConnected(false)
      setNotifications([])
      setPreferences(null)
      setMetrics(null)
      
      logger.info('[usePushNotifications] Sistema limpiado exitosamente')

    } catch (error) {
      logger.error('[usePushNotifications] Error limpiando sistema', error as Error)
    }
  }, [])

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // EFECTOS
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    // Auto-inicializar si está habilitado
    if (autoInitialize && !isInitialized) {
      initialize().catch(error => {
        logger.error('[usePushNotifications] Error en auto-inicialización', error)
      })
    }

    return () => {
      // Cleanup al desmontar
      if (isInitialized) {
        cleanup().catch(error => {
          logger.error('[usePushNotifications] Error en cleanup', error)
        })
      }
    }
  }, [autoInitialize, initialize, cleanup, isInitialized])

  useEffect(() => {
    // Actualizar preferencias cuando cambia el usuario
    if (user?.id && pushServiceRef.current && isInitialized) {
      pushServiceRef.current.getNotificationPreferences(user.id)
        .then(prefs => setPreferences(prefs))
        .catch(error => {
          logger.error('[usePushNotifications] Error cargando preferencias del usuario', error)
        })
    }
  }, [user, isInitialized])

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS DE UTILIDAD
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  const createNotification = useCallback((
    title: string,
    body: string,
    options: Partial<PushNotification> = {}
  ): PushNotification => {
    if (!pushServiceRef.current) {
      throw new Error('Servicio de notificaciones no inicializado')
    }

    return pushServiceRef.current.createNotification(title, body, options)
  }, [])

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // RETORNO
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  return {
    isSupported,
    permission,
    isInitialized,
    isConnected,
    notifications,
    preferences,
    metrics,
    
    // Métodos
    initialize,
    requestPermission,
    sendNotification,
    updatePreferences,
    getMetrics,
    markAsRead,
    cleanup
  }
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES EXPORTADAS
// ════════════════════════════════════════════════════════════════════════════════════════════════

export const createSmartNotification = (
  type: 'sales' | 'inventory' | 'financial' | 'system' | 'ai' | 'reminder',
  data: any,
  priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
): Partial<PushNotification> => {
  const notifications = {
    sales: {
      title: 'Alerta de Ventas',
      body: 'Nueva actividad en ventas detectada',
      category: 'sales' as const,
      priority,
      actions: [
        { action: 'view', title: 'Ver Detalles' },
        { action: 'dismiss', title: 'Descartar' }
      ]
    },
    inventory: {
      title: 'Alerta de Inventario',
      body: 'Niveles de inventario requieren atención',
      category: 'inventory' as const,
      priority,
      actions: [
        { action: 'view-inventory', title: 'Ver Inventario' },
        { action: 'create-order', title: 'Crear Orden' }
      ]
    },
    financial: {
      title: 'Alerta Financiera',
      body: 'Actividad financiera importante detectada',
      category: 'financial' as const,
      priority,
      actions: [
        { action: 'view-finances', title: 'Ver Finanzas' },
        { action: 'details', title: 'Detalles' }
      ]
    },
    system: {
      title: 'Notificación del Sistema',
      body: 'Actualización o mantenimiento del sistema',
      category: 'system' as const,
      priority,
      actions: [
        { action: 'view-settings', title: 'Ver Configuración' }
      ]
    },
    ai: {
      title: 'Insight de IA',
      body: 'Nueva recomendación o análisis disponible',
      category: 'ai' as const,
      priority,
      actions: [
        { action: 'view-insights', title: 'Ver Insights' },
        { action: 'learn-more', title: 'Más Información' }
      ]
    },
    reminder: {
      title: 'Recordatorio',
      body: 'Tarea pendiente o recordatorio importante',
      category: 'reminder' as const,
      priority,
      actions: [
        { action: 'view-task', title: 'Ver Tarea' },
        { action: 'complete', title: 'Completar' }
      ]
    }
  }

  return notifications[type] || notifications.system
}