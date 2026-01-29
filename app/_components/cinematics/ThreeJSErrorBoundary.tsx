'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ THREE.JS ERROR BOUNDARY — WebGL Safety Wrapper
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import React, { Component, ReactNode } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ThreeJSErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 THREE.JS ERROR:', error, errorInfo)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback por defecto
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
          <motion.div
            className="max-w-md space-y-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Error de Renderizado 3D</h2>
            <p className="text-gray-400">
              No se pudo cargar la cinematográfica. Redirigiendo...
            </p>
            <motion.div
              className="h-1 w-full overflow-hidden rounded-full bg-white/10"
            >
              <motion.div
                className="h-full bg-violet-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'linear' }}
                onAnimationComplete={() => {
                  window.location.href = '/login'
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}
