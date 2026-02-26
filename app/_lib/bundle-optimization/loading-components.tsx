/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 LOADING COMPONENTS - Componentes de carga con JSX
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 LOADING COMPONENTS - Componentes de carga optimizados
// ═══════════════════════════════════════════════════════════════════════════════

export function Loading3D({ message = 'Cargando visualización 3D...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-100 bg-gray-900 rounded-lg">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-blue-400 opacity-20" />
      </div>
      <p className="mt-4 text-gray-400 text-sm">{message}</p>
    </div>
  )
}

export function LoadingAI({ message = 'Cargando asistente inteligente...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-75 bg-linear-to-br from-purple-900 to-blue-900 rounded-lg p-6">
      <div className="relative mb-4">
        <div className="animate-pulse rounded-full h-16 w-16 bg-linear-to-r from-purple-500 to-blue-500 opacity-60" />
        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 bg-linear-to-r from-purple-400 to-blue-400 opacity-30" />
      </div>
      <p className="text-white font-medium">{message}</p>
      <div className="flex space-x-1 mt-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export function LoadingChart({ message = 'Cargando visualización de datos...' }: { message?: string }) {
  return (
    <div className="animate-pulse bg-gray-800 rounded-lg p-6 h-96">
      <div className="h-6 bg-gray-700 rounded mb-4 w-1/3" />
      {message && <p className="text-gray-500 text-xs mb-2">{message}</p>}
      <div className="space-y-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-4 bg-gray-700 rounded w-20" />
            <div className="h-4 bg-gray-600 rounded flex-1" />
            <div className="h-4 bg-gray-700 rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 PERFORMANCE METRICS HOC
// ═══════════════════════════════════════════════════════════════════════════════

function useLoadMetricsInternal(componentName: string) {
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
    }
  }, [componentName])

  return { loadTime, isLoading, startLoad }
}

export function withLoadMetrics<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
) {
  return function WrappedComponent(props: P) {
    const { loadTime, startLoad } = useLoadMetricsInternal(componentName)
    const finishLoad = useMemo(() => startLoad(), [startLoad])

    useEffect(() => {
      finishLoad()
    }, [finishLoad])

    return (
      <div className="relative">
        <Component {...props} />
        {process.env.NODE_ENV === 'development' && loadTime !== null && (
          <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
            {componentName}: {loadTime.toFixed(0)}ms
          </div>
        )}
      </div>
    )
  }
}
