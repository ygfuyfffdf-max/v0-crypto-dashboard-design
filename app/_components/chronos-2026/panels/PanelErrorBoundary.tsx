'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ PANEL ERROR BOUNDARY — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Error Boundary específico para paneles que captura:
 * - Errores de extensiones browser (TronLink, MetaMask, etc.)
 * - Errores de renderizado React
 * - Errores de acceso a propiedades undefined
 *
 * Implementa fallback UI elegante en caso de error.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  panelName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class PanelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { panelName = 'Panel' } = this.props

    // Log del error
    logger.error(`Error en ${panelName}`, error, {
      context: 'PanelErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorMessage: error.message,
      errorStack: error.stack,
    })

    // Detectar si es error de extensión browser
    const isExtensionError =
      error.message.includes('injected.js') ||
      error.message.includes('content_script') ||
      error.message.includes('extension') ||
      error.stack?.includes('chrome-extension://') ||
      error.stack?.includes('moz-extension://')

    if (isExtensionError) {
      logger.warn('Extension interference detected', {
        context: 'PanelErrorBoundary',
        panelName,
        error: error.message,
      })

      toast.warning(
        `Extensión de navegador detectada. ${panelName} puede no cargar completamente.`,
        {
          description:
            'Intenta desactivar extensiones como TronLink, MetaMask o similares, o usar modo incógnito.',
          duration: 8000,
        },
      )
    } else {
      toast.error(`Error en ${panelName}`, {
        description: 'El panel encontró un error. Por favor, recarga la página.',
        duration: 5000,
      })
    }

    this.setState({
      errorInfo,
    })
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
      // Si hay fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback UI por defecto
      return (
        <div className="flex min-h-[400px] w-full items-center justify-center rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/20 via-gray-950 to-red-950/10 p-8 backdrop-blur-xl">
          <div className="max-w-md space-y-6 text-center">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <AlertCircle className="h-12 w-12 text-red-400" />
              </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Error en {this.props.panelName || 'Panel'}
              </h3>
              <p className="text-sm text-gray-400">
                El panel encontró un error inesperado. Esto puede deberse a:
              </p>
            </div>

            {/* Lista de causas */}
            <ul className="space-y-2 text-left text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Extensión de navegador interfiriendo (TronLink, MetaMask)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Conexión a base de datos temporalmente interrumpida</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">•</span>
                <span>Datos incompletos o corruptos</span>
              </li>
            </ul>

            {/* Error técnico (si está en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="rounded-lg bg-red-950/50 p-4 text-left">
                <p className="mb-2 text-xs font-semibold text-red-300">
                  Detalles técnicos (solo en desarrollo):
                </p>
                <pre className="overflow-x-auto text-[10px] text-red-200">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 py-3 font-medium text-red-300 transition-all hover:bg-red-500/30 hover:text-red-200"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500/20 px-4 py-3 font-medium text-violet-300 transition-all hover:bg-violet-500/30 hover:text-violet-200"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar Página
              </button>
            </div>

            {/* Sugerencia */}
            <p className="text-xs text-gray-600">
              Si el problema persiste, intenta desactivar extensiones del navegador o usar modo
              incógnito.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
