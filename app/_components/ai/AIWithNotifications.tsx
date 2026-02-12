/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖 CHRONOS AI WITH NOTIFICATIONS — SUPREME ELEVATION 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componente que integra el sistema de IA predictivo con notificaciones push inteligentes.
 * Genera alertas automáticas basadas en análisis de datos y patrones detectados.
 *
 * @version 1.0.0 - SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, TrendingUp, AlertTriangle, Lightbulb, Package, DollarSign } from 'lucide-react'
import { usePushNotifications, createSmartNotification } from '@/app/_hooks/usePushNotifications'
import { ChronosAI } from '@/app/_lib/ai/predictive-analytics'
import { AuroraGlassCard } from '../ui/AuroraGlassSystem'
import { QuantumGlassCard } from '../ui/QuantumElevatedUI'

interface AIWithNotificationsProps {
  className?: string
  autoAnalyze?: boolean
  analysisInterval?: number // en minutos
}

interface NotificationConfig {
  enabled: boolean
  thresholds: {
    salesPredictionConfidence: number
    anomalySeverity: 'low' | 'medium' | 'high' | 'critical'
    inventoryPriority: 'low' | 'medium' | 'high'
    trendChangePercentage: number
  }
  categories: {
    sales: boolean
    inventory: boolean
    financial: boolean
    ai: boolean
  }
}

export function AIWithNotifications({
  className = '',
  autoAnalyze = true,
  analysisInterval = 30 // minutos
}: AIWithNotificationsProps) {
  const { 
    isInitialized, 
    isConnected, 
    sendNotification,
    notifications 
  } = usePushNotifications()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null)
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    enabled: true,
    thresholds: {
      salesPredictionConfidence: 0.7,
      anomalySeverity: 'medium',
      inventoryPriority: 'medium',
      trendChangePercentage: 10
    },
    categories: {
      sales: true,
      inventory: true,
      financial: true,
      ai: true
    }
  })

  const [aiInsights, setAiInsights] = useState<{
    salesPrediction: any,
    anomalies: any,
    inventoryRecommendations: any,
    trends: any
  }>({
    salesPrediction: null,
    anomalies: [],
    inventoryRecommendations: [],
    trends: null
  })

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // ANÁLISIS Y GENERACIÓN DE NOTIFICACIONES
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  const performAIAnalysis = useCallback(async () => {
    if (!isInitialized || !isConnected || !notificationConfig.enabled) {
      return
    }

    setIsAnalyzing(true)

    try {
      console.log('[AIWithNotifications] Iniciando análisis de IA...')

      // Ejecutar análisis en paralelo
      const [salesPrediction, anomalies, inventoryRecommendations, trends] = await Promise.all([
        ChronosAI.SalesPredictor.predictSales(30),
        ChronosAI.AnomalyDetector.detectAnomalies(7),
        ChronosAI.InventoryRecommender.generateRecommendations(),
        ChronosAI.TrendAnalyzer.analyzeTrends(90)
      ])

      const newInsights = {
        salesPrediction,
        anomalies,
        inventoryRecommendations,
        trends
      }

      setAiInsights(newInsights)
      setLastAnalysis(new Date())

      // Generar notificaciones basadas en los resultados
      await generateSmartNotifications(newInsights)

      console.log('[AIWithNotifications] Análisis completado exitosamente')

    } catch (error) {
      console.error('[AIWithNotifications] Error en análisis de IA:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [isInitialized, isConnected, notificationConfig])

  const generateSmartNotifications = useCallback(async (insights: any) => {
    const notifications: any[] = []

    // Notificaciones de predicción de ventas
    if (notificationConfig.categories.sales && insights.salesPrediction) {
      const { confidence, next30Days, trend } = insights.salesPrediction
      
      if (confidence >= notificationConfig.thresholds.salesPredictionConfidence) {
        const salesNotification = createSmartNotification('sales', {
          prediction: next30Days,
          confidence,
          trend,
          period: '30 días'
        }, 'normal')

        salesNotification.title = 'Predicción de Ventas Inteligente'
        salesNotification.body = `Se proyectan $${next30Days.toLocaleString()} en ventas (${trend === 'upward' ? '📈' : trend === 'downward' ? '📉' : '➡️'} ${trend})`
        
        if (trend === 'upward' && confidence > 0.8) {
          salesNotification.priority = 'high'
          salesNotification.body += '. ¡Excelente momento para aumentar inventario!'
        } else if (trend === 'downward') {
          salesNotification.priority = 'normal'
          salesNotification.body += '. Considerar ajustar estrategias.'
        }

        notifications.push(salesNotification)
      }
    }

    // Notificaciones de anomalías
    if (notificationConfig.categories.ai && insights.anomalies) {
      const { anomalies, severityBreakdown } = insights.anomalies
      const criticalAnomalies = anomalies.filter((a: any) => a.severity === 'critical')
      const highAnomalies = anomalies.filter((a: any) => a.severity === 'high')

      if (criticalAnomalies.length > 0) {
        const anomalyNotification = createSmartNotification('ai', {
          type: 'anomaly',
          count: criticalAnomalies.length,
          severity: 'critical',
          anomalies: criticalAnomalies
        }, 'critical')

        anomalyNotification.title = '🚨 Anomalías Críticas Detectadas'
        anomalyNotification.body = `${criticalAnomalies.length} anomalías críticas requieren atención inmediata`
        anomalyNotification.requireInteraction = true

        notifications.push(anomalyNotification)
      }

      if (highAnomalies.length > 0 && notificationConfig.thresholds.anomalySeverity !== 'high') {
        const highAnomalyNotification = createSmartNotification('ai', {
          type: 'anomaly',
          count: highAnomalies.length,
          severity: 'high',
          anomalies: highAnomalies
        }, 'high')

        highAnomalyNotification.title = '⚠️ Anomalías Importantes'
        highAnomalyNotification.body = `${highAnomalies.length} anomalías importantes detectadas`

        notifications.push(highAnomalyNotification)
      }
    }

    // Notificaciones de inventario
    if (notificationConfig.categories.inventory && insights.inventoryRecommendations) {
      const { products } = insights.inventoryRecommendations
      const urgentProducts = products.filter((p: any) => p.priority === 'high')
      const mediumProducts = products.filter((p: any) => p.priority === 'medium')

      if (urgentProducts.length > 0) {
        const inventoryNotification = createSmartNotification('inventory', {
          type: 'urgent_restock',
          count: urgentProducts.length,
          products: urgentProducts,
          totalInvestment: urgentProducts.reduce((sum: number, p: any) => sum + p.estimatedCost, 0)
        }, 'high')

        inventoryNotification.title = '📦 Productos con Stock Crítico'
        inventoryNotification.body = `${urgentProducts.length} productos necesitan reabastecimiento urgente`
        inventoryNotification.actions = [
          { action: 'view-inventory', title: 'Ver Inventario' },
          { action: 'create-order', title: 'Crear Orden' }
        ]

        notifications.push(inventoryNotification)
      }

      if (mediumProducts.length > 3 && notificationConfig.thresholds.inventoryPriority === 'medium') {
        const mediumInventoryNotification = createSmartNotification('inventory', {
          type: 'restock_suggestion',
          count: mediumProducts.length,
          products: mediumProducts,
          totalInvestment: mediumProducts.reduce((sum: number, p: any) => sum + p.estimatedCost, 0)
        }, 'normal')

        mediumInventoryNotification.title = '📋 Recomendaciones de Inventario'
        mediumInventoryNotification.body = `${mediumProducts.length} productos recomendados para reabastecimiento`

        notifications.push(mediumInventoryNotification)
      }
    }

    // Notificaciones de tendencias
    if (notificationConfig.categories.financial && insights.trends) {
      const { salesTrend, financialTrend } = insights.trends

      // Alertas de tendencias de ventas significativas
      if (Math.abs(salesTrend.changePercentage) >= notificationConfig.thresholds.trendChangePercentage) {
        const trendNotification = createSmartNotification('sales', {
          type: 'trend_alert',
          metric: 'sales',
          change: salesTrend.changePercentage,
          currentValue: salesTrend.currentValue,
          trend: salesTrend.trend
        }, salesTrend.changePercentage > 20 ? 'high' : 'normal')

        trendNotification.title = salesTrend.changePercentage > 0 ? '📈 Tendencia Alcista' : '📉 Tendencia Bajista'
        trendNotification.body = `Ventas ${salesTrend.changePercentage > 0 ? 'aumentaron' : 'disminuyeron'} ${Math.abs(salesTrend.changePercentage).toFixed(1)}% este período`

        notifications.push(trendNotification)
      }

      // Alertas de tendencias financieras
      if (Math.abs(financialTrend.changePercentage) >= notificationConfig.thresholds.trendChangePercentage) {
        const financialTrendNotification = createSmartNotification('financial', {
          type: 'trend_alert',
          metric: 'financial',
          change: financialTrend.changePercentage,
          currentValue: financialTrend.currentValue,
          trend: financialTrend.trend
        }, financialTrend.changePercentage > 15 ? 'high' : 'normal')

        financialTrendNotification.title = financialTrend.changePercentage > 0 ? '💰 Capital en Aumento' : '💸 Cambio en Capital'
        financialTrendNotification.body = `Capital ${financialTrend.changePercentage > 0 ? 'aumentó' : 'disminuyó'} ${Math.abs(financialTrend.changePercentage).toFixed(1)}%`

        notifications.push(financialTrendNotification)
      }
    }

    // Enviar notificaciones
    for (const notification of notifications) {
      try {
        await sendNotification(notification)
        console.log(`[AIWithNotifications] Notificación enviada: ${notification.title}`)
      } catch (error) {
        console.error(`[AIWithNotifications] Error enviando notificación: ${notification.title}`, error)
      }
    }

    console.log(`[AIWithNotifications] ${notifications.length} notificaciones inteligentes generadas y enviadas`)
  }, [sendNotification, notificationConfig])

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // EFECTOS Y CONFIGURACIÓN
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (autoAnalyze && isInitialized && isConnected) {
      // Análisis inicial
      performAIAnalysis()

      // Configurar intervalo de análisis automático
      const interval = setInterval(() => {
        performAIAnalysis()
      }, analysisInterval * 60 * 1000) // Convertir minutos a milisegundos

      return () => {
        clearInterval(interval)
      }
    }
    return undefined;
  }, [autoAnalyze, isInitialized, isConnected, performAIAnalysis, analysisInterval])

  const updateNotificationConfig = useCallback((newConfig: Partial<NotificationConfig>) => {
    setNotificationConfig(prev => ({
      ...prev,
      ...newConfig
    }))
  }, [])

  // ════════════════════════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════════════════════════

  return (
    <div className={className}>
      <AuroraGlassCard>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">IA + Notificaciones Inteligentes</h2>
                <p className="text-sm text-gray-400">
                  {isInitialized && isConnected ? 'Sistema activo' : 'Inicializando...'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isAnalyzing && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full"
                />
              )}
              
              <button
                onClick={performAIAnalysis}
                disabled={isAnalyzing || !isInitialized}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-lg hover:from-violet-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAnalyzing ? 'Analizando...' : 'Analizar Ahora'}
              </button>
            </div>
          </div>

          {/* Estado del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <QuantumGlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isInitialized && isConnected 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {isInitialized && isConnected ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white">Estado del Sistema</h3>
                <p className="text-xs text-gray-400">
                  {notifications.length} notificaciones recientes
                </p>
              </div>
            </QuantumGlassCard>

            <QuantumGlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                  <span className="text-xs px-2 py-1 rounded-full bg-rose-500/20 text-rose-400">
                    {aiInsights.anomalies?.anomalies?.filter((a: any) => a.severity === 'critical').length || 0}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white">Anomalías Críticas</h3>
                <p className="text-xs text-gray-400">
                  Requieren atención inmediata
                </p>
              </div>
            </QuantumGlassCard>

            <QuantumGlassCard>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="h-5 w-5 text-cyan-400" />
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                    {aiInsights.inventoryRecommendations?.products?.filter((p: any) => p.priority === 'high').length || 0}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white">Stock Crítico</h3>
                <p className="text-xs text-gray-400">
                  Productos urgentes
                </p>
              </div>
            </QuantumGlassCard>
          </div>

          {/* Últimas Notificaciones */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Notificaciones Recientes</h3>
            
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-gray-300 font-medium">Sin notificaciones recientes</h4>
                <p className="text-gray-500 text-sm mt-2">
                  El sistema generará notificaciones automáticamente cuando detecte eventos importantes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {notifications.slice(0, 5).map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          notification.priority === 'critical' ? 'bg-rose-500/20' :
                          notification.priority === 'high' ? 'bg-amber-500/20' :
                          notification.priority === 'normal' ? 'bg-cyan-500/20' :
                          'bg-emerald-500/20'
                        }`}>
                          {notification.category === 'sales' && <DollarSign className="h-4 w-4 text-white" />}
                          {notification.category === 'inventory' && <Package className="h-4 w-4 text-white" />}
                          {notification.category === 'ai' && <Lightbulb className="h-4 w-4 text-white" />}
                          {notification.category === 'financial' && <DollarSign className="h-4 w-4 text-white" />}
                          {notification.category === 'system' && <Bell className="h-4 w-4 text-white" />}
                          {notification.category === 'reminder' && <Bell className="h-4 w-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                              notification.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                              notification.priority === 'normal' ? 'bg-cyan-500/20 text-cyan-400' :
                              'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{notification.body}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp && new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Configuración */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Configuración de Notificaciones</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">Notificaciones Inteligentes</h4>
                  <p className="text-xs text-gray-400">Activar análisis automático y alertas inteligentes</p>
                </div>
                <button
                  onClick={() => updateNotificationConfig({ enabled: !notificationConfig.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationConfig.enabled ? 'bg-violet-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Ventas</span>
                  <button
                    onClick={() => updateNotificationConfig({
                      categories: { ...notificationConfig.categories, sales: !notificationConfig.categories.sales }
                    })}
                    className={`w-4 h-4 rounded border-2 ${
                      notificationConfig.categories.sales 
                        ? 'bg-violet-600 border-violet-600' 
                        : 'border-gray-600'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Inventario</span>
                  <button
                    onClick={() => updateNotificationConfig({
                      categories: { ...notificationConfig.categories, inventory: !notificationConfig.categories.inventory }
                    })}
                    className={`w-4 h-4 rounded border-2 ${
                      notificationConfig.categories.inventory 
                        ? 'bg-violet-600 border-violet-600' 
                        : 'border-gray-600'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Finanzas</span>
                  <button
                    onClick={() => updateNotificationConfig({
                      categories: { ...notificationConfig.categories, financial: !notificationConfig.categories.financial }
                    })}
                    className={`w-4 h-4 rounded border-2 ${
                      notificationConfig.categories.financial 
                        ? 'bg-violet-600 border-violet-600' 
                        : 'border-gray-600'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">IA</span>
                  <button
                    onClick={() => updateNotificationConfig({
                      categories: { ...notificationConfig.categories, ai: !notificationConfig.categories.ai }
                    })}
                    className={`w-4 h-4 rounded border-2 ${
                      notificationConfig.categories.ai 
                        ? 'bg-violet-600 border-violet-600' 
                        : 'border-gray-600'
                    }`}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Último análisis: {lastAnalysis ? lastAnalysis.toLocaleString() : 'Nunca'}
              </div>
            </div>
          </div>
        </div>
      </AuroraGlassCard>
    </div>
  )
}