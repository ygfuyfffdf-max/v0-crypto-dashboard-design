"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ ERROR BOUNDARY PREMIUM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Captura errores de:
 * - Extensiones browser (TronLink, MetaMask, etc.) que inyectan código
 * - props undefined en componentes React
 * - Errores runtime no manejados
 *
 * Previene pantalla negra, muestra UI fallback elegante
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from "@/app/lib/utils/logger"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Component, ErrorInfo, ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundaryPremium extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    logger.error("ErrorBoundary capturó error", error, {
      context: "ErrorBoundaryPremium",
      componentStack: errorInfo.componentStack,
    })

    // Detectar errores de extensiones browser
    const isExtensionError =
      error.message?.includes("injected") ||
      error.message?.includes("extension") ||
      error.message?.includes("icon") ||
      error.stack?.includes("injected.js")

    if (isExtensionError) {
      logger.warn("⚠️ Error causado por extensión browser detectado", {
        context: "ErrorBoundaryPremium",
        message: error.message,
      })
    }

    this.setState({
      error,
      errorInfo,
    })

    // Callback opcional
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback si se proporciona
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback UI premium por defecto
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6">
          <div className="w-full max-w-2xl">
            {/* Card glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="rounded-2xl bg-red-500/20 p-4">
                    <AlertCircle className="h-12 w-12 text-red-400" />
                  </div>
                </div>

                {/* Title */}
                <h1 className="mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-center text-2xl font-bold text-transparent">
                  Oops! Algo salió mal
                </h1>

                {/* Description */}
                <p className="mb-6 text-center text-white/60">
                  Se detectó un error inesperado. Esto puede ser causado por una extensión del
                  navegador (TronLink, MetaMask, etc.) que interfiere con la aplicación.
                </p>

                {/* Error details (solo en dev) */}
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <p className="mb-2 text-xs font-semibold text-red-400">Error técnico:</p>
                    <pre className="overflow-auto text-xs text-white/80">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={this.handleReset}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Recargar Aplicación
                  </button>

                  <button
                    onClick={() => window.history.back()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10"
                  >
                    Volver Atrás
                  </button>
                </div>

                {/* Help text */}
                <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-center text-sm text-cyan-400">
                    💡 <strong>Sugerencia:</strong> Si el problema persiste, intenta desactivar
                    extensiones del navegador temporalmente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
