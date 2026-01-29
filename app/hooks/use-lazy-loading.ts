/**
 * Lazy Loading Hooks
 * Hooks para carga diferida de componentes e imágenes
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Hook para carga diferida de elementos cuando entran al viewport
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || hasLoaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [hasLoaded, options])

  return { ref, isVisible, hasLoaded }
}

/**
 * Hook para carga diferida de imágenes
 */
export function useLazyImage(
  src: string,
  options?: {
    priority?: 'high' | 'medium' | 'low'
    blur?: string
    onLoad?: () => void
    onError?: (error?: Error) => void
    networkAware?: boolean
  },
) {
  const ref = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setLoaded(true)
      setIsLoaded(true)
      options?.onLoad?.()
    }
    img.onerror = () => {
      setError(true)
      options?.onError?.()
    }
    img.src = src
  }, [src, options])

  return { ref, loaded, error, imageSrc, isLoaded }
}

/**
 * Hook para carga progresiva de imágenes (placeholder → full)
 */
export function useProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string,
  options?: {
    priority?: 'high' | 'medium' | 'low'
    blur?: string
    onLoad?: () => void
    onError?: (error?: Error) => void
    networkAware?: boolean
  },
) {
  const ref = useRef<HTMLDivElement>(null)
  const [src, setSrc] = useState(lowQualitySrc)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setSrc(highQualitySrc)
      setIsLoaded(true)
      options?.onLoad?.()
    }
    img.onerror = () => {
      setError(true)
      options?.onError?.()
    }
    img.src = highQualitySrc
  }, [highQualitySrc, options])

  return { ref, src, isLoaded, isBlurred: !isLoaded, error }
}
