/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ BROWSER EXTENSION ERROR BOUNDARY — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Error Boundary especializado para detectar y manejar errores causados por
 * extensiones del navegador (TronLink, MetaMask, AdBlockers, etc.) que inyectan
 * scripts como "injected.js" y pueden causar errores como "TypeError: Cannot read
 * property 'icon' of undefined"
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { logger } from '@/app/lib/utils/logger'
import { AlertTriangle, RefreshCw, Shield, XCircle } from 'lucide-react'
import React, { Component, ErrorInfo, ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Props {
  children: ReactNode
  fallback?: ReactNode
  /** Nombre del componente para logs */
  componentName?: string
  /** Callback cuando se detecta error de extensión */
  onExtensionError?: (error: Error, extensionName?: string) => void
  /** Si debe reintentar automáticamente */
  autoRetry?: boolean
  /** Máximo intentos de reintento */
  maxRetries?: number
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  isExtensionError: boolean
  suspectedExtension?: string
  retryCount: number
}

// Patrones conocidos de errores de extensiones
const EXTENSION_ERROR_PATTERNS = [
  { pattern: /injected\.js/i, extension: 'TronLink/Web3 Wallet' },
  { pattern: /inpage\.js/i, extension: 'MetaMask' },
  { pattern: /content\.js/i, extension: 'Browser Extension' },
  { pattern: /contentscript/i, extension: 'Browser Extension' },
  { pattern: /chrome-extension/i, extension: 'Chrome Extension' },
  { pattern: /moz-extension/i, extension: 'Firefox Extension' },
  { pattern: /safari-extension/i, extension: 'Safari Extension' },
  { pattern: /Cannot read.*icon.*undefined/i, extension: 'Icon Injection Extension' },
  { pattern: /Cannot read.*property.*of undefined/i, extension: 'Unknown Extension' },
  { pattern: /ethereum/i, extension: 'Ethereum Wallet Extension' },
  { pattern: /web3/i, extension: 'Web3 Extension' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class BrowserExtensionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isExtensionError: false,
    retryCount: 0,
  }

  private retryTimeout: NodeJS.Timeout | null = null

  /**
   * Detecta si el error proviene de una extensión del navegador
   */
  private static detectExtensionError(error: Error): {
    isExtension: boolean
    suspectedExtension?: string
  } {
    const errorString = `${error.message} ${error.stack || ''}`

    for (const { pattern, extension } of EXTENSION_ERROR_PATTERNS) {
      if (pattern.test(errorString)) {
        return { isExtension: true, suspectedExtension: extension }
      }
    }

    // Heurística adicional: errores en propiedades comunes que las extensiones inyectan
    if (
      errorString.includes('undefined') &&
      (errorString.includes('icon') ||
        errorString.includes('window.') ||
        errorString.includes('document.'))
    ) {
      return { isExtension: true, suspectedExtension: 'Posible extensión inyectando código' }
    }

    return { isExtension: false }
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const { isExtension, suspectedExtension } =
      BrowserExtensionErrorBoundary.detectExtensionError(error)

    return {
      hasError: true,
      error,
      isExtensionError: isExtension,
      suspectedExtension,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName, onExtensionError } = this.props
    const { isExtension, suspectedExtension } =
      BrowserExtensionErrorBoundary.detectExtensionError(error)

    // Log estructurado
    logger.error(`🛡️ ERROR BOUNDARY [${componentName || 'Unknown'}]`, error, {
      context: 'BrowserExtensionErrorBoundary',
      isExtensionError: isExtension,
      suspectedExtension,
      componentStack: errorInfo.componentStack,
      stack: error.stack,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
    })

    // Callback para errores de extensión
    if (isExtension && onExtensionError) {
      onExtensionError(error, suspectedExtension)
    }

    // Auto-retry si está habilitado y es error de extensión
    if (
      this.props.autoRetry &&
      isExtension &&
      this.state.retryCount < (this.props.maxRetries || 3)
    ) {
      this.scheduleRetry()
    }

    this.setState({ errorInfo })
  }

  private scheduleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }

    this.retryTimeout = setTimeout(
      () => {
        this.setState((prev) => ({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          isExtensionError: false,
          retryCount: prev.retryCount + 1,
        }))
      },
      1000 * (this.state.retryCount + 1),
    ) // Backoff exponencial
  }

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      isExtensionError: false,
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    const { hasError, isExtensionError, suspectedExtension, error, retryCount } = this.state
    const { children, fallback, maxRetries = 3 } = this.props

    if (!hasError) {
      return children
    }

    // Fallback personalizado
    if (fallback) {
      return fallback
    }

    // UI de error para extensiones del navegador
    if (isExtensionError) {
      return (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 p-6 backdrop-blur-xl">
          <div className="max-w-md text-center">
            {/* Icono animado */}
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-yellow-500/20" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Shield className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Título */}
            <h3 className="mb-2 text-lg font-semibold text-yellow-300">
              Interferencia de Extensión Detectada
            </h3>

            {/* Descripción */}
            <p className="mb-4 text-sm text-gray-400">
              {suspectedExtension ? (
                <>
                  Una extensión del navegador (
                  <span className="text-yellow-400">{suspectedExtension}</span>) está interfiriendo
                  con CHRONOS.
                </>
              ) : (
                'Una extensión del navegador está interfiriendo con la aplicación.'
              )}
            </p>

            {/* Sugerencias */}
            <div className="mb-4 rounded-lg bg-gray-800/50 p-3 text-left text-xs text-gray-500">
              <p className="mb-2 font-medium text-gray-400">💡 Sugerencias:</p>
              <ul className="space-y-1">
                <li>• Abre CHRONOS en modo incógnito</li>
                <li>• Desactiva temporalmente las extensiones de crypto wallets</li>
                <li>• Usa un perfil de navegador sin extensiones</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex justify-center gap-3">
              {retryCount < maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 rounded-lg bg-yellow-500/20 px-4 py-2 text-sm font-medium text-yellow-300 transition-all hover:bg-yellow-500/30"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar ({maxRetries - retryCount} intentos)
                </button>
              )}
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-gray-600"
              >
                Recargar Página
              </button>
            </div>
          </div>
        </div>
      )
    }

    // UI de error genérico
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5 p-6 backdrop-blur-xl">
        <div className="max-w-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <h3 className="mb-2 text-lg font-semibold text-red-300">Error Inesperado</h3>

          <p className="mb-4 text-sm text-gray-400">
            {error?.message || 'Ocurrió un error al cargar este componente.'}
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-500/30"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-gray-600"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: Detectar extensiones del navegador
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useDetectBrowserExtensions(): {
  hasWalletExtension: boolean
  detectedExtensions: string[]
} {
  const [state, setState] = React.useState({
    hasWalletExtension: false,
    detectedExtensions: [] as string[],
  })

  React.useEffect(() => {
    const detected: string[] = []

    // Detectar extensiones comunes
    if (typeof window !== 'undefined') {
      // @ts-expect-error - Propiedades inyectadas por extensiones
      if (window.ethereum) detected.push('Ethereum Wallet (MetaMask/similar)')
      // @ts-expect-error - Propiedades inyectadas por extensiones
      if (window.tronWeb || window.tronLink) detected.push('TronLink')
      // @ts-expect-error - Propiedades inyectadas por extensiones
      if (window.solana) detected.push('Phantom/Solana Wallet')
      // @ts-expect-error - Propiedades inyectadas por extensiones
      if (window.cardano) detected.push('Cardano Wallet')
      // @ts-expect-error - Propiedades inyectadas por extensiones
      if (window.keplr) detected.push('Keplr Wallet')
    }

    setState({
      hasWalletExtension: detected.length > 0,
      detectedExtensions: detected,
    })

    if (detected.length > 0) {
      logger.info('🔌 Extensiones de navegador detectadas', {
        context: 'useDetectBrowserExtensions',
        extensions: detected,
      })
    }
  }, [])

  return state
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOC: Envolver componente con Error Boundary
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function withBrowserExtensionErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<Props, 'children'>,
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const WithErrorBoundary: React.FC<P> = (props) => (
    <BrowserExtensionErrorBoundary
      componentName={displayName}
      autoRetry
      maxRetries={2}
      {...options}
    >
      <WrappedComponent {...props} />
    </BrowserExtensionErrorBoundary>
  )

  WithErrorBoundary.displayName = `withBrowserExtensionErrorBoundary(${displayName})`

  return WithErrorBoundary
}

export default BrowserExtensionErrorBoundary
