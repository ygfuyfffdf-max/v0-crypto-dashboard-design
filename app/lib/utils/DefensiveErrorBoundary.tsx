// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — ERROR BOUNDARY PARA VALIDACIÓN DEFENSIVA
// Componente para capturar errores de .map is not a function
// ═══════════════════════════════════════════════════════════════

'use client'

import { logger } from '@/app/lib/utils/logger'
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DefensiveErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Si el error contiene .map is not a function, activar el boundary
    if (error.message?.includes('.map is not a function')) {
      logger.error('🔴 ERROR BOUNDARY ACTIVADO: .map is not a function', error, {
        context: 'DefensiveErrorBoundary',
      })
      return { hasError: true, error }
    }

    return { hasError: false }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('🔴 ERROR CAPTURADO POR BOUNDARY', error, {
      context: 'DefensiveErrorBoundary',
      errorInfo: errorInfo.componentStack,
      stack: error.stack,
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-64 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-6">
            <div className="text-center">
              <div className="mb-2 text-red-400">⚠️ Error de datos detectado</div>
              <p className="text-sm text-red-300">
                Se detectó un problema con el formato de datos.
                <br />
                Recargando automáticamente...
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Recargar Página
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// Hook para validación defensiva en componentes
export function useDefensiveArray<T>(data: unknown, context: string = 'Unknown'): T[] {
  return React.useMemo(() => {
    if (Array.isArray(data)) {
      return data as T[]
    }

    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
      logger.info(`🟡 VALIDACIÓN DEFENSIVA: ${context} - extrayendo data property`, {
        originalData: data,
      })
      return (data as any).data as T[]
    }

    logger.warn(`🔴 VALIDACIÓN DEFENSIVA: ${context} - forzando array vacío`, {
      receivedData: data,
      type: typeof data,
    })
    return [] as T[]
  }, [data, context])
}