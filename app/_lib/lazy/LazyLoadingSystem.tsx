/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS INFINITY 2030 — SISTEMA DE LAZY LOADING AVANZADO
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de carga diferida ultra-optimizado con:
 * - Componentes lazy con fallbacks premium
 * - Prefetching inteligente basado en navegación
 * - Intersection observer para carga bajo demanda
 * - Skeleton loaders animados
 * - Error boundaries integrados
 * - Retry automático con exponential backoff
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import React, {
  ComponentType,
  ReactNode,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface LazyComponentOptions<P> {
  fallback?: ReactNode
  errorFallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode)
  loadingDelay?: number
  minLoadingTime?: number
  retryCount?: number
  retryDelay?: number
  onLoad?: () => void
  onError?: (error: Error) => void
}

interface LazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  fallback?: ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SKELETON COMPONENTS — Loaders animados premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'text' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  animation = 'pulse',
  width,
  height,
}) => {
  const variants = {
    default: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
    rectangular: 'rounded-none',
  }

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%]',
    none: '',
  }

  return (
    <div
      className={cn(
        'bg-white/10',
        variants[variant],
        animations[animation],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SKELETON PRESETS — Skeletons predefinidos para diferentes componentes
// ═══════════════════════════════════════════════════════════════════════════════════════

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3', className)}>
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
    <Skeleton height={60} />
    <div className="flex gap-2">
      <Skeleton width="30%" height={32} className="rounded-xl" />
      <Skeleton width="30%" height={32} className="rounded-xl" />
    </div>
  </div>
)

export const MetricCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-5 bg-white/5 rounded-2xl border border-white/10', className)}>
    <Skeleton width="40%" height={14} className="mb-3" />
    <Skeleton width="70%" height={32} className="mb-2" />
    <Skeleton width="50%" height={12} />
  </div>
)

export const TableSkeleton: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {/* Header */}
    <div className="flex gap-4 p-3 bg-white/5 rounded-xl">
      {[20, 30, 25, 15, 10].map((width, i) => (
        <Skeleton key={i} width={`${width}%`} height={14} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-3 bg-white/[0.02] rounded-xl">
        {[20, 30, 25, 15, 10].map((width, j) => (
          <Skeleton key={j} width={`${width}%`} height={16} />
        ))}
      </div>
    ))}
  </div>
)

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 bg-white/5 rounded-2xl border border-white/10', className)}>
    <div className="flex justify-between items-center mb-4">
      <Skeleton width={120} height={18} />
      <div className="flex gap-2">
        <Skeleton width={60} height={28} className="rounded-lg" />
        <Skeleton width={60} height={28} className="rounded-lg" />
      </div>
    </div>
    <div className="relative h-[200px]">
      <div className="absolute inset-0 flex items-end justify-around gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            width="100%"
            height={`${Math.random() * 60 + 40}%`}
            className="rounded-t-lg"
          />
        ))}
      </div>
    </div>
  </div>
)

export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({
  fields = 4,
  className,
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton width={80} height={14} />
        <Skeleton height={44} className="rounded-xl" />
      </div>
    ))}
    <div className="flex gap-3 pt-2">
      <Skeleton width={100} height={40} className="rounded-xl" />
      <Skeleton width={100} height={40} className="rounded-xl" />
    </div>
  </div>
)

export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({
  items = 5,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl">
        <Skeleton variant="circular" width={36} height={36} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
        </div>
        <Skeleton width={60} height={24} className="rounded-lg" />
      </div>
    ))}
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════════════════
// LAZY LOAD WRAPPER — Componente con carga diferida por intersección
// ═══════════════════════════════════════════════════════════════════════════════════════

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  className?: string
  as?: keyof JSX.IntrinsicElements
  minHeight?: string | number
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
  triggerOnce = true,
  className,
  as: Component = 'div',
  minHeight = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce])

  useEffect(() => {
    if (isVisible && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [isVisible, hasLoaded])

  const shouldRender = triggerOnce ? hasLoaded : isVisible

  return (
    <Component
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      className={className}
      style={{ minHeight: !shouldRender ? minHeight : undefined }}
    >
      <AnimatePresence mode="wait">
        {shouldRender ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {fallback || <Skeleton height={minHeight} />}
          </motion.div>
        )}
      </AnimatePresence>
    </Component>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARY — Boundary con retry y fallback
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class LazyErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, errorInfo: null }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    this.props.onError?.(error)
  }

  reset = () => {
    this.setState({ error: null, errorInfo: null })
  }

  render() {
    if (this.state.error) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.reset)
      }
      
      return this.props.fallback || (
        <DefaultErrorFallback error={this.state.error} onRetry={this.reset} />
      )
    }

    return this.props.children
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DEFAULT ERROR FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════════════

interface DefaultErrorFallbackProps {
  error: Error
  onRetry: () => void
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-8 text-center bg-red-500/10 rounded-2xl border border-red-500/20"
  >
    <div className="w-12 h-12 mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
      <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">Algo salió mal</h3>
    <p className="text-sm text-white/60 mb-4 max-w-sm">
      {error.message || 'Ha ocurrido un error inesperado'}
    </p>
    <motion.button
      onClick={onRetry}
      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      Reintentar
    </motion.button>
  </motion.div>
)

// ═══════════════════════════════════════════════════════════════════════════════════════
// LAZY COMPONENT FACTORY — Factory para crear componentes lazy
// ═══════════════════════════════════════════════════════════════════════════════════════

export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentOptions<P> = {}
): React.FC<P> {
  const {
    fallback = <CardSkeleton />,
    errorFallback,
    loadingDelay = 0,
    minLoadingTime = 0,
    retryCount = 3,
    retryDelay = 1000,
    onLoad,
    onError,
  } = options

  // Crear componente lazy con retry
  const LazyComponent = lazy(async () => {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const startTime = Date.now()
        
        // Delay antes de cargar (para evitar flash)
        if (loadingDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, loadingDelay))
        }
        
        const module = await importFn()
        
        // Tiempo mínimo de carga (para evitar flash)
        const elapsed = Date.now() - startTime
        if (minLoadingTime > 0 && elapsed < minLoadingTime) {
          await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsed))
        }
        
        onLoad?.()
        return module
      } catch (error) {
        lastError = error as Error
        
        if (attempt < retryCount) {
          // Exponential backoff
          await new Promise((resolve) => 
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          )
        }
      }
    }
    
    onError?.(lastError!)
    throw lastError
  })

  // Wrapper component
  const WrappedComponent: React.FC<P> = (props) => (
    <LazyErrorBoundary
      fallback={
        typeof errorFallback === 'function'
          ? (error, reset) => errorFallback(error, reset)
          : errorFallback
      }
      onError={onError}
    >
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  )

  WrappedComponent.displayName = 'LazyComponent'
  return WrappedComponent
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PREFETCH UTILITIES — Utilidades para prefetch
// ═══════════════════════════════════════════════════════════════════════════════════════

const prefetchedComponents = new Set<string>()

export function prefetchComponent(
  importFn: () => Promise<unknown>,
  componentId: string
): void {
  if (prefetchedComponents.has(componentId)) return
  
  prefetchedComponents.add(componentId)
  
  // Prefetch en idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFn().catch(() => {
        prefetchedComponents.delete(componentId)
      })
    })
  } else {
    setTimeout(() => {
      importFn().catch(() => {
        prefetchedComponents.delete(componentId)
      })
    }, 1)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LAZY PANEL COMPONENTS — Componentes lazy para paneles del sistema
// ═══════════════════════════════════════════════════════════════════════════════════════

// Factory para crear paneles lazy con skeleton apropiado
export function createLazyPanel<P extends object>(
  panelName: string,
  importFn: () => Promise<{ default: ComponentType<P> }>
): React.FC<P> {
  return createLazyComponent(importFn, {
    fallback: (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton width={200} height={28} />
          <div className="flex gap-2">
            <Skeleton width={100} height={36} className="rounded-xl" />
            <Skeleton width={100} height={36} className="rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={8} />
      </div>
    ),
    errorFallback: (error, retry) => (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <DefaultErrorFallback error={error} onRetry={retry} />
        <p className="mt-4 text-sm text-white/40">
          Error cargando el panel: {panelName}
        </p>
      </div>
    ),
    loadingDelay: 100,
    minLoadingTime: 300,
    retryCount: 2,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  createLazyComponent,
  prefetchComponent,
  LazyLoad,
  LazyErrorBoundary,
  DefaultErrorFallback,
}

export type { LazyComponentOptions, LazyLoadOptions }
