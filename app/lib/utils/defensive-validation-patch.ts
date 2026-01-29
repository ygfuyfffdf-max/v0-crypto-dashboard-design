// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — PARCHE DE EMERGENCIA PARA VALIDACIÓN DEFENSIVA
// Agregado para corregir cualquier caso edge que cause .map is not a function
// ═══════════════════════════════════════════════════════════════

import { logger } from './logger'
// Tipos importados desde app/types/window.d.ts

// Extender Array.prototype para detectar casos donde se intente hacer .map sobre no-arrays
if (typeof window !== 'undefined') {
  // Helper global para validación defensiva
  ;(window as Window).validateArrayData = function (data: unknown, context = 'Unknown'): unknown[] {
    if (Array.isArray(data)) {
      return data
    }

    if (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      Array.isArray((data as { data: unknown[] }).data)
    ) {
      logger.warn(`Validación defensiva: ${context} - extrayendo data property`, {
        context: 'DefensivePatch',
        data,
      })
      return (data as { data: unknown[] }).data
    }

    logger.warn(`Validación defensiva: ${context} - forzando array vacío`, {
      context: 'DefensivePatch',
      data,
    })
    return []
  }

  // Parche para fetch global (solo para debugging en desarrollo)
  if (process.env.NODE_ENV === 'development' && !window._originalFetch) {
    window._originalFetch = window.fetch
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      return window._originalFetch!(input, init).then((response) => {
        // Solo loguear APIs internas para debugging
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
        if (url.includes('/api/') && process.env.NODE_ENV === 'development') {
          logger.debug(`API Request: ${url}`, { context: 'DefensivePatch' })
        }
        return response
      })
    }
  }
}

export {}
