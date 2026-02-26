// @ts-nocheck
// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS DYNAMIC IMPORTS - Code Splitting y Lazy Loading
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Utilidades para implementar code splitting dinámico y reducir bundle size
 */

import dynamic from 'next/dynamic'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 3D COMPONENTS - Lazy loaded para reducir bundle inicial
// ═══════════════════════════════════════════════════════════════════════════════

export const ThreeCanvas = dynamic(
  () => import('@/app/_components/3d/ThreeCanvas').then(mod => mod.ThreeCanvas),
  { ssr: false }
)

export const ParticleSystem = dynamic(
  () => import('@/app/_components/3d/ParticleSystem').then(mod => mod.ParticleSystem),
  { ssr: false }
)

export const SplineScene = dynamic(
  () => import('@/app/_components/3d/SplineScene').then(mod => mod.SplineScene),
  { ssr: false }
)

// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 AI COMPONENTS - Dynamic imports para librerías pesadas
// ═══════════════════════════════════════════════════════════════════════════════

export const AIChatPanel = dynamic(
  () => import('@/app/_components/ai/AIChatPanel').then(mod => mod.AIChatPanel),
  { ssr: false }
)

export const VoiceRecognition = dynamic(
  () => import('@/app/_components/ai/VoiceRecognition').then(mod => mod.VoiceRecognition),
  { ssr: false }
)

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 CHART COMPONENTS - Lazy loading para visualizaciones
// ═══════════════════════════════════════════════════════════════════════════════

export const ChartContainer = dynamic(
  () => import('@/app/_components/charts/ChartContainer').then(mod => mod.ChartContainer),
  { ssr: true }
)

export const DataVisualization = dynamic(
  () => import('@/app/_components/charts/DataVisualization').then(mod => mod.DataVisualization),
  { ssr: true }
)

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 HOOKS - Lazy loading para hooks pesados
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react'

/**
 * Hook para cargar librerías 3D solo cuando se necesiten
 */
export function use3DLibraries() {
  const [libraries, setLibraries] = useState<{
    THREE?: unknown;
    Fiber?: unknown;
    Drei?: unknown;
  }>({})
  const [isLoading, setIsLoading] = useState(false)

  const loadLibraries = async () => {
    if (isLoading || libraries.THREE) return
    
    setIsLoading(true)
    try {
      const [THREE, Fiber, Drei] = await Promise.all([
        import('three'),
        import('@react-three/fiber'),
        import('@react-three/drei'),
      ])
      
      setLibraries({ THREE, Fiber, Drei })
    } catch (error) {
      console.error('Error loading 3D libraries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { libraries, isLoading, loadLibraries }
}

/**
 * Hook para cargar librerías AI solo cuando se necesiten
 */
export function useAILibraries() {
  const [libraries, setLibraries] = useState<{
    ai?: unknown;
    openai?: unknown;
    anthropic?: unknown;
  }>({})
  const [isLoading, setIsLoading] = useState(false)

  const loadLibraries = async () => {
    if (isLoading || libraries.ai) return
    
    setIsLoading(true)
    try {
      const [ai, openai, anthropic] = await Promise.all([
        import('ai'),
        import('@ai-sdk/openai'),
        import('@ai-sdk/anthropic'),
      ])
      
      setLibraries({ ai, openai, anthropic })
    } catch (error) {
      console.error('Error loading AI libraries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { libraries, isLoading, loadLibraries }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 UTILITIES - Dynamic imports para utilidades pesadas
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cargar utilidades de exportación solo cuando se necesiten
 */
export async function loadExportUtilities() {
  const { exportToExcel, exportToPDF, exportToCSV } = await import('@/app/_lib/utils/export')
  return { exportToExcel, exportToPDF, exportToCSV }
}

/**
 * Cargar utilidades de gráficos solo cuando se necesiten
 */
export async function loadChartUtilities() {
  const results = await Promise.all([
    import('chart.js'),
    import('recharts'),
    import('d3'),
  ])
  return { ChartJS: results[0], Recharts: results[1], D3: results[2] }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 CODE SPLITTING STRATEGY - Estrategia de división de código
// ═══════════════════════════════════════════════════════════════════════════════

export const routeStrategies = {
  dashboard: { priority: 'high' as const, preload: true, components: ['DashboardLayout', 'Navigation', 'MainPanel'] },
  ia: { priority: 'medium' as const, preload: false, components: ['AIChatPanel', 'VoiceRecognition', 'AIInsights'] },
  visualizations: { priority: 'low' as const, preload: false, components: ['ThreeCanvas', 'ParticleSystem', 'SplineScene'] },
  reports: { priority: 'low' as const, preload: false, components: ['DataVisualization', 'ChartContainer', 'ExportTools'] },
}

export function usePreloadStrategy() {
  useEffect(() => {
    Object.values(routeStrategies)
      .filter(strategy => strategy.priority === 'high' && strategy.preload)
      .forEach(strategy => {
        strategy.components.forEach(component => {
          import(`@/app/_components/${component}`).catch(console.error)
        })
      })
    
    setTimeout(() => {
      Object.values(routeStrategies)
        .filter(strategy => strategy.priority === 'medium')
        .forEach(strategy => {
          strategy.components.forEach(component => {
            import(`@/app/_components/${component}`).catch(console.error)
          })
        })
    }, 5000)
  }, [])
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 LOADING COMPONENTS & METRICS - Re-exported from TSX module
// ═══════════════════════════════════════════════════════════════════════════════

export { Loading3D, LoadingAI, LoadingChart } from './loading-components'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 PERFORMANCE METRICS
// ═══════════════════════════════════════════════════════════════════════════════

export function useLoadMetrics(componentName: string) {
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const startLoad = useCallback(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      setLoadTime(duration)
      setIsLoading(false)
      console.log(`[LoadMetrics] ${componentName} loaded in ${duration.toFixed(2)}ms`)
      
      if (typeof window !== 'undefined' && (window as Record<string, unknown>)['gtag']) {
        const gtag = (window as Record<string, unknown>)['gtag'] as (...args: unknown[]) => void
        gtag('event', 'component_load_time', { component_name: componentName, load_time: duration })
      }
    }
  }, [componentName])

  return { loadTime, isLoading, startLoad }
}

export { withLoadMetrics } from './loading-components'
