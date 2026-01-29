// app/_hooks/useReducedMotion.ts
// ═══════════════════════════════════════════════════════════════════════════════
// ♿ CHRONOS INFINITY 2026 — REDUCED MOTION HOOK
// ═══════════════════════════════════════════════════════════════════════════════
// Respeta preferencias del usuario para animaciones reducidas
// WCAG 2.2 AAA - Requirement 2.3.3
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { useState, useEffect } from 'react'

/**
 * Hook que detecta si el usuario prefiere animaciones reducidas
 * @returns true si el usuario prefiere reducir animaciones
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Verificar soporte
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Establecer valor inicial
    setPrefersReducedMotion(mediaQuery.matches)

    // Listener para cambios en preferencias
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Usar addEventListener moderno si está disponible
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Obtiene variantes de animación condicionadas por reduced motion
 */
export function getMotionVariants(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.01 },
    }
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }
}

export default useReducedMotion
