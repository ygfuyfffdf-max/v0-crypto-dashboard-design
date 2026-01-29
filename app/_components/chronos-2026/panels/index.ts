/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 - PANELS INDEX (DEFINITIVO)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * PANELES OFICIALES AURORA UNIFIED - Producción
 * Diseño: Aurora Glassmorphism Premium con efectos Aurora Boreal
 *
 * PALETA CHRONOS: #000000, #8B00FF, #FFD700, #FF1493, #00FF88, #FFFFFF
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// � PREMIUM PANEL ENHANCERS — ULTRA ELEVATION COMPONENTS 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  PREMIUM_THEME,
  PremiumChartWrapper,
  PremiumKPICard,
  PremiumLoading,
  PremiumPanelWrapper,
  PremiumSectionDivider,
  PremiumTableWrapper,
} from './PremiumPanelEnhancer'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 SUPREME PANEL BACKGROUNDS — SHADER SYSTEM INTEGRATION 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  SupremeAIBackground,
  SupremeAlmacenBackground,
  SupremeBancosBackground,
  SupremeCard,
  SupremeClientesBackground,
  SupremeComprasBackground,
  SupremeDashboardBackground,
  SupremeDistribuidoresBackground,
  SupremeGastosBackground,
  SupremeMovimientosBackground,
  SupremePanelBackground,
  SupremeVentasBackground,
  type GradientConfig,
  type SupremePanelBackgroundProps,
} from './SupremePanelBackgrounds'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🏠 DASHBOARD PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { AuroraDashboardUnified } from './AuroraDashboardUnified'

// 🚀 ULTRA PREMIUM DASHBOARD DEMO 2026
export { UltraPremiumDashboardDemo } from './UltraPremiumDashboardDemo'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌈 AURORA UNIFIED PANELS - CHRONOS INFINITY 2026 (DEFINITIVOS)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// 📦 Panel de Almacén
export { AuroraAlmacenPanelUnified } from './AuroraAlmacenPanelUnified'

// 🏦 Panel de Bancos / Bóvedas
export {
  AuroraBancosPanelUnified,
  AuroraBancosPanelUnified as AuroraBovedaPanel,
} from './AuroraBancosPanelUnified'

// 👥 Panel de Clientes
export { AuroraClientesPanelUnified } from './AuroraClientesPanelUnified'

// 📋 Panel de Compras / Órdenes
export { AuroraComprasPanelUnified } from './AuroraComprasPanelUnified'

// 🚚 Panel de Distribuidores
export { AuroraDistribuidoresPanelUnified } from './AuroraDistribuidoresPanelUnified'

// 💸 Panel de Gastos y Abonos
export { AuroraGastosYAbonosPanelUnified } from './AuroraGastosYAbonosPanelUnified'

// 🔄 Panel de Movimientos
export { AuroraMovimientosPanel } from './AuroraMovimientosPanel'

// 💰 Panel de Ventas
export { AuroraVentasPanelUnified, type Venta } from './AuroraVentasPanelUnified'

// 📜 Timeline Virtualizado de Ventas (FIX SCROLL ISSUE)
export { VentasVirtualizedTimeline } from './VentasVirtualizedTimeline'

// 🤖 Panel de IA (CHRONOS AI)
export { AuroraAIPanelUnified } from './AuroraAIPanelUnified'

// 📊 Activity Feed Virtualizado
export { ActivityFeedVirtual } from './ActivityFeedVirtual'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Types inline para compatibilidad
export type MovimientoData = {
  id: string
  tipo: string
  monto: number
  fecha: Date
  concepto: string
}

export type GastoData = {
  id: string
  tipo: string
  monto: number
  fecha: Date
  concepto: string
}

export type BancoId =
  | 'boveda_monte'
  | 'boveda_usa'
  | 'profit'
  | 'leftie'
  | 'azteca'
  | 'flete_sur'
  | 'utilidades'
