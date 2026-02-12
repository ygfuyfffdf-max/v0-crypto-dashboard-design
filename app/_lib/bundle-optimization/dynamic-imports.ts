/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS DYNAMIC IMPORTS - Code Splitting y Lazy Loading
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Utilidades para implementar code splitting dinámico y reducir bundle size
 */

import dynamic from 'next/dynamic'
import { Suspense, lazy } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 3D COMPONENTS - Lazy loaded para reducir bundle inicial
// ═══════════════════════════════════════════════════════════════════════════════

export const ThreeCanvas = dynamic(
  () => import('@/app/_components/3d/ThreeCanvas').then(mod => mod.ThreeCanvas),
  {
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />,
    ssr: false,
  }
)

export const ParticleSystem = dynamic(
  () => import('@/app/_components/3d/ParticleSystem').then(mod => mod.ParticleSystem),
  {
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />,
    ssr: false,
  }
)

export const SplineScene = dynamic(
  () => import('@/app/_components/3d/SplineScene').then(mod => mod.SplineScene),
  {
    loading: () => <div className="animate-pulse bg-gray-800 rounded-lg h-96" />,
    ssr: false,
  }
)

// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 AI COMPONENTS - Dynamic imports para librerías pesadas
// ═══════════════════════════════════════════════════════════════════════════════

export const AIChatPanel = dynamic(
  () => import('@/app/_components/ai/AIChatPanel').then(mod => mod.AIChatPanel),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-800 rounded-lg p-6">
        <div className="h-4 bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-700 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    ),
    ssr: false,
  }
)

export const VoiceRecognition = dynamic(
  () => import('@/app/_components/ai/VoiceRecognition').then(mod => mod.VoiceRecognition),
  {
    loading: () => <div className="animate-pulse bg-gray-800 rounded-full w-12 h-12" />,
    ssr: false,
  }
)

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 CHART COMPONENTS - Lazy loading para visualizaciones
// ═══════════════════════════════════════════════════════════════════════════════

export const ChartContainer = dynamic(
  () => import('@/app/_components/charts/ChartContainer').then(mod => mod.ChartContainer),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-800 rounded-lg p-6 h-96">
        <div className="h-8 bg-gray-700 rounded mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-700 rounded" style={{ width: `${Math.random() * 100}%` }} />
          ))}
        </div>
      </div>
    ),
    ssr: true,
  }
)

export const DataVisualization = dynamic(
  () => import('@/app/_components/charts/DataVisualization').then(mod => mod.DataVisualization),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-800 rounded-lg p-6 h-96">
        <div className="h-64 bg-gray-700 rounded mb-4" />
        <div className="h-8 bg-gray-700 rounded w-1/2" />
      </div>
    ),
    ssr: true,
  }
)

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 HOOKS - Lazy loading para hooks pesados
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook para cargar librerías 3D solo cuando se necesiten
 */
export function use3DLibraries() {
  const [libraries, setLibraries] = useState<{
    THREE?: any;
    Fiber?: any;
    Drei?: any;
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
    ai?: any;
    openai?: any;
    anthropic?: any;
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
  const { ChartJS, Recharts, D3 } = await Promise.all([
    import('chart.js'),
    import('recharts'),
    import('d3'),
  ])
  return { ChartJS, Recharts, D3 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 CODE SPLITTING STRATEGY - Estrategia de división de código
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estrategia de code splitting por rutas
 */
export const routeStrategies = {
  // Dashboard principal - carga inmediata
  dashboard: {
    priority: 'high',
    preload: true,
    components: ['DashboardLayout', 'Navigation', 'MainPanel']
  },
  
  // IA Panel - lazy loading
  ia: {
    priority: 'medium',
    preload: false,
    components: ['AIChatPanel', 'VoiceRecognition', 'AIInsights']
  },
  
  // 3D Visualizations - lazy loading
  visualizations: {
    priority: 'low',
    preload: false,
    components: ['ThreeCanvas', 'ParticleSystem', 'SplineScene']
  },
  
  // Reports - lazy loading
  reports: {
    priority: 'low',
    preload: false,
    components: ['DataVisualization', 'ChartContainer', 'ExportTools']
  }
}

/**
 * Preload strategy basada en prioridad
 */
export function usePreloadStrategy() {
  useEffect(() => {
    // Preload high priority components
    Object.entries(routeStrategies)
      .filter(([_, strategy]) => strategy.priority === 'high' && strategy.preload)
      .forEach(([route, strategy]) => {
        strategy.components.forEach(component => {
          // Preload component
          import(`@/app/_components/${component}`).catch(console.error)
        })
      })
    
    // Preload medium priority after delay
    setTimeout(() => {
      Object.entries(routeStrategies)
        .filter(([_, strategy]) => strategy.priority === 'medium')
        .forEach(([route, strategy]) => {
          strategy.components.forEach(component => {
            import(`@/app/_components/${component}`).catch(console.error)
          })
        })
    }, 5000) // 5 seconds delay
  }, [])
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 LOADING COMPONENTS - Componentes de carga optimizados
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Componente de carga para 3D
 */
export function Loading3D({ message = "Cargando visualización 3D..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-900 rounded-lg">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-blue-400 opacity-20"></div>
      </div>
      <p className="mt-4 text-gray-400 text-sm">{message}</p>
    </div>
  )
}

/**
 * Componente de carga para AI
 */
export function LoadingAI({ message = "Cargando asistente inteligente..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg p-6">
      <div className="relative mb-4">
        <div className="animate-pulse rounded-full h-16 w-16 bg-gradient-to-r from-purple-500 to-blue-500 opacity-60"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 bg-gradient-to-r from-purple-400 to-blue-400 opacity-30"></div>
      </div>
      <p className="text-white font-medium">{message}</p>
      <div className="flex space-x-1 mt-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

/**
 * Componente de carga para Charts
 */
export function LoadingChart({ message = "Cargando visualización de datos..." }: { message?: string }) {
  return (
    <div className="animate-pulse bg-gray-800 rounded-lg p-6 h-96">
      <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-4 bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-600 rounded flex-1" style={{ width: `${Math.random() * 80 + 20}%` }}></div>
            <div className="h-4 bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 PERFORMANCE METRICS - Métricas de performance
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook para medir el tiempo de carga de componentes
 */
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
      
      // Log performance metrics
      console.log(`[LoadMetrics] ${componentName} loaded in ${duration.toFixed(2)}ms`)
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'component_load_time', {
          component_name: componentName,
          load_time: duration,
        })
      }
    }
  }, [componentName])

  return { loadTime, isLoading, startLoad }
}

/**
 * Componente envoltorio para métricas de carga
 */
export function withLoadMetrics<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function WrappedComponent(props: P) {
    const { loadTime, isLoading, startLoad } = useLoadMetrics(componentName)
    const finishLoad = useMemo(() => startLoad(), [startLoad])

    useEffect(() => {
      finishLoad()
    }, [finishLoad])

    return (
      <div className="relative">
        <Component {...props} />
        {process.env.NODE_ENV === 'development' && loadTime && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {componentName}: {loadTime.toFixed(0)}ms
          </div>
        )}
      </div>
    )
  }
}