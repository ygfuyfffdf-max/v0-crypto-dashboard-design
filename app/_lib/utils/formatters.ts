// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — FORMATTERS
// Re-export de utilidades de formateo
// ═══════════════════════════════════════════════════════════════

// Re-export desde el archivo principal de utils
export {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  toDate,
} from './index'

// Alias adicionales para compatibilidad
export { formatDate as formatFecha, formatCurrency as formatMoney } from './index'
