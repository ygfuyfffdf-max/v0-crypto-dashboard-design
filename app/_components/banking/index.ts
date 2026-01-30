/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏦 BANKING MODULE iOS PREMIUM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exports for banking dashboard components with iOS glassmorphism design
 * Features: Clean metrics, smooth animations, no problematic parallax/3D effects
 */

export { BankingDashboard, default as BankingDashboardDefault } from './BankingDashboard'
export { ScheduledCutsSystem, default as ScheduledCutsSystemDefault } from './ScheduledCutsSystem'
export { BankDetailDashboard, default as BankDetailDashboardDefault } from './BankDetailDashboard'
export { BankDashboardSupreme, default as BankDashboardSupremeDefault } from './BankDashboardSupreme'

// Re-export iOS components commonly used in banking
export {
  iOSMetricCard,
  iOSTransactionCard,
  iOSStatsCard,
  iOSGlassCard,
  iOSProgress,
  iOSButton,
} from '../ui/ios'
