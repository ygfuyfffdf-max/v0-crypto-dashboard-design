/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS DASHBOARDS — SISTEMA DE DASHBOARDS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas del sistema de dashboards:
 * - AdvancedMetricsDashboard: Dashboard de métricas avanzadas
 * - BancoDashboardSupreme: Dashboard individual por banco con variables primordiales
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// Advanced metrics dashboard
export { default as AdvancedMetricsDashboard } from './AdvancedMetricsDashboard'

// Individual bank dashboard with primordial variables
export {
  BancoDashboardSupreme,
  default as BancoDashboardSupremeDefault
} from './BancoDashboardSupreme'
