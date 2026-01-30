/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2026 — API ROUTE: MÉTRICAS EN TIEMPO REAL
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Endpoint para obtener y emitir métricas del dashboard
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MetricData {
  id: string
  name: string
  value: number
  previousValue?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'neutral'
  unit?: string
  category: string
  timestamp: number
}

interface MetricsSnapshot {
  metrics: MetricData[]
  generatedAt: number
  period: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GENERADORES DE DATOS
// ═══════════════════════════════════════════════════════════════════════════════════════

function generateRevenue(): MetricData {
  const value = Math.round(Math.random() * 50000 + 100000)
  const previousValue = Math.round(value * (0.85 + Math.random() * 0.3))
  const change = value - previousValue
  const changePercent = Math.round((change / previousValue) * 100 * 10) / 10
  
  return {
    id: 'revenue',
    name: 'Ingresos Totales',
    value,
    previousValue,
    change,
    changePercent,
    trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
    unit: 'MXN',
    category: 'financial',
    timestamp: Date.now(),
  }
}

function generateUsers(): MetricData {
  const value = Math.round(Math.random() * 5000 + 5000)
  const previousValue = Math.round(value * (0.9 + Math.random() * 0.2))
  const change = value - previousValue
  const changePercent = Math.round((change / previousValue) * 100 * 10) / 10
  
  return {
    id: 'active_users',
    name: 'Usuarios Activos',
    value,
    previousValue,
    change,
    changePercent,
    trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
    category: 'users',
    timestamp: Date.now(),
  }
}

function generateTransactions(): MetricData {
  const value = Math.round(Math.random() * 8000 + 10000)
  const previousValue = Math.round(value * (0.88 + Math.random() * 0.24))
  const change = value - previousValue
  const changePercent = Math.round((change / previousValue) * 100 * 10) / 10
  
  return {
    id: 'transactions',
    name: 'Transacciones',
    value,
    previousValue,
    change,
    changePercent,
    trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
    category: 'operations',
    timestamp: Date.now(),
  }
}

function generateConversionRate(): MetricData {
  const value = Math.round((Math.random() * 3 + 3) * 100) / 100
  const previousValue = Math.round((value * (0.92 + Math.random() * 0.16)) * 100) / 100
  const change = Math.round((value - previousValue) * 100) / 100
  const changePercent = Math.round((change / previousValue) * 100 * 10) / 10
  
  return {
    id: 'conversion_rate',
    name: 'Tasa de Conversión',
    value,
    previousValue,
    change,
    changePercent,
    trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
    unit: '%',
    category: 'performance',
    timestamp: Date.now(),
  }
}

function generateOrderValue(): MetricData {
  const value = Math.round(Math.random() * 500 + 1200)
  const previousValue = Math.round(value * (0.9 + Math.random() * 0.2))
  const change = value - previousValue
  const changePercent = Math.round((change / previousValue) * 100 * 10) / 10
  
  return {
    id: 'avg_order_value',
    name: 'Valor Promedio Orden',
    value,
    previousValue,
    change,
    changePercent,
    trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
    unit: 'MXN',
    category: 'financial',
    timestamp: Date.now(),
  }
}

function generateChurnRate(): MetricData {
  const value = Math.round((Math.random() * 2 + 1) * 100) / 100
  const previousValue = Math.round((value * (0.85 + Math.random() * 0.3)) * 100) / 100
  const change = Math.round((value - previousValue) * 100) / 100
  const changePercent = Math.round((change / previousValue) * 100 * 10) / 10
  
  return {
    id: 'churn_rate',
    name: 'Tasa de Abandono',
    value,
    previousValue,
    change,
    changePercent,
    // Para churn, menor es mejor, así que invertimos el trend
    trend: changePercent < 0 ? 'up' : changePercent > 0 ? 'down' : 'neutral',
    unit: '%',
    category: 'performance',
    timestamp: Date.now(),
  }
}

function generateTimeSeriesData(hours: number = 24): { timestamp: number; value: number }[] {
  const data = []
  const now = Date.now()
  const baseValue = Math.random() * 5000 + 5000
  
  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = now - i * 3600000
    const variance = Math.sin(i * 0.5) * 1000 + Math.random() * 500
    const value = Math.round(baseValue + variance)
    data.push({ timestamp, value })
  }
  
  return data
}

function generateCategoryDistribution(): { name: string; value: number; color: string }[] {
  const categories = [
    { name: 'Compras', color: '#a855f7' },
    { name: 'Ventas', color: '#ec4899' },
    { name: 'Transferencias', color: '#3b82f6' },
    { name: 'Otros', color: '#f59e0b' },
  ]
  
  let remaining = 100
  return categories.map((cat, i) => {
    const isLast = i === categories.length - 1
    const value = isLast ? remaining : Math.round(Math.random() * Math.min(remaining - 10, 40) + 5)
    remaining -= value
    return { ...cat, value }
  })
}

function generatePerformanceData(): { label: string; ingresos: number; gastos: number; utilidad: number }[] {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
  return months.map(label => {
    const ingresos = Math.round(Math.random() * 50000 + 30000)
    const gastos = Math.round(ingresos * (0.4 + Math.random() * 0.3))
    const utilidad = ingresos - gastos
    return { label, ingresos, gastos, utilidad }
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GET: Obtener métricas
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const period = searchParams.get('period') || '24h'

  try {
    switch (type) {
      case 'kpis':
        return NextResponse.json({
          success: true,
          data: {
            revenue: generateRevenue(),
            activeUsers: generateUsers(),
            transactions: generateTransactions(),
            conversionRate: generateConversionRate(),
            avgOrderValue: generateOrderValue(),
            churnRate: generateChurnRate(),
          },
          generatedAt: Date.now(),
        })

      case 'timeseries':
        const hours = period === '1h' ? 1 : period === '24h' ? 24 : period === '7d' ? 168 : 720
        return NextResponse.json({
          success: true,
          data: generateTimeSeriesData(hours),
          period,
          generatedAt: Date.now(),
        })

      case 'distribution':
        return NextResponse.json({
          success: true,
          data: generateCategoryDistribution(),
          generatedAt: Date.now(),
        })

      case 'performance':
        return NextResponse.json({
          success: true,
          data: generatePerformanceData(),
          generatedAt: Date.now(),
        })

      case 'all':
      default:
        return NextResponse.json({
          success: true,
          data: {
            kpis: {
              revenue: generateRevenue(),
              activeUsers: generateUsers(),
              transactions: generateTransactions(),
              conversionRate: generateConversionRate(),
              avgOrderValue: generateOrderValue(),
              churnRate: generateChurnRate(),
            },
            timeseries: generateTimeSeriesData(24),
            distribution: generateCategoryDistribution(),
            performance: generatePerformanceData(),
          },
          generatedAt: Date.now(),
        })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate metrics' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// POST: Registrar evento de métrica
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data } = body

    // Aquí se procesaría y almacenaría el evento
    // Por ahora solo confirmamos la recepción

    return NextResponse.json({
      success: true,
      message: 'Event recorded',
      event,
      timestamp: Date.now(),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to record event' },
      { status: 500 }
    )
  }
}
