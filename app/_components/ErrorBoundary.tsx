'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛡️ ERROR BOUNDARY COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Captura errores de JavaScript en componentes React, especialmente:
 * - Errores de extensiones browser (TronLink, Metamask, etc.)
 * - Errores de renderizado
 * - Errores de WebGPU/shaders
 */

import { logger } from '@/app/lib/utils/logger'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error con contexto
    logger.error('ErrorBoundary capturó error', error, {
      context: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    })

    this.setState({ errorInfo })

    // Callback opcional
    this.props.onError?.(error, errorInfo)

    // Detectar errores de extensiones browser
    const isExtensionError =
      error.message.includes('injected') ||
      error.message.includes('TronLink') ||
      error.message.includes('ethereum') ||
      error.message.includes('icon') ||
      error.stack?.includes('chrome-extension')

    if (isExtensionError) {
      logger.warn('Detectado error de extensión browser', {
        context: 'ErrorBoundary',
        data: { message: error.message, isExtension: true },
      })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Usar fallback custom si se proporciona
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback por defecto
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Error en el componente</h3>
                <p className="text-sm text-gray-400">Ocurrió un error inesperado</p>
              </div>
            </div>

            {this.state.error && (
              <div className="rounded-lg bg-black/30 p-3">
                <p className="text-xs font-mono text-red-300">{this.state.error.message}</p>
              </div>
            )}

            {/* Detectar errores de extensiones */}
            {this.state.error &&
              (this.state.error.message.includes('injected') ||
                this.state.error.message.includes('TronLink') ||
                this.state.error.message.includes('ethereum')) && (
                <div className="rounded-lg bg-yellow-500/10 p-3 border border-yellow-500/20">
                  <p className="text-sm text-yellow-300">
                    ⚠️ Detectamos que una extensión del navegador (TronLink, Metamask, etc.) está
                    causando conflictos. Intenta deshabilitar tus extensiones crypto temporalmente.
                  </p>
                </div>
              )}

            <button
              onClick={this.handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 py-3 font-medium text-red-300 transition-all hover:bg-red-500/30"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC para envolver componentes con ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
