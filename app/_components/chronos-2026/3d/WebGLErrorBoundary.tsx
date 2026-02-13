'use client'

/**
 * Error boundary para componentes WebGL/Three.js.
 * Evita que "WebGL context lost" y "can't access property 'length', t is undefined"
 * (postprocessing/EffectComposer) rompan toda la app.
 * En producción renderiza null para que la UI siga funcionando sin el fondo 3D.
 */

import React, { type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class WebGLErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Evitar ruido en consola en producción; opcionalmente reportar a Sentry
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WebGLErrorBoundary]', error.message, errorInfo.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}

export default WebGLErrorBoundary
