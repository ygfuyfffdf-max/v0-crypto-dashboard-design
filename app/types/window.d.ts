// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — DECLARACIÓN DE TIPOS PARA WINDOW
// ═══════════════════════════════════════════════════════════════

declare global {
  interface Window {
    validateArrayData: (data: unknown, context?: string) => unknown[]
    _originalFetch?: typeof fetch
  }
}

export {}
