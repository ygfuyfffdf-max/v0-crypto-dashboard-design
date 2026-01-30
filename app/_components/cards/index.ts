/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 CARDS MODULE — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exports for detail cards, KPI cards and traceability components
 */

export {
  TraceabilityDetailCard,
  VentaDetailCard,
  DetailFieldItem,
  TraceabilityTimeline,
  RelatedRecordsList,
  AlertBanner,
  StatsMiniCards,
  default as TraceabilityDetailCardDefault,
} from './TraceabilityDetailCards'

// KPI Cards animadas
export {
  default as KPICardAnimated,
  KPICard,
  KPICardVentas,
  KPICardUsuarios,
  KPICardBalance,
  KPICardProductos,
  KPICardPorcentaje,
  type KPICardProps,
  type FormatoKPI,
  type VarianteKPI,
  type TamanoKPI,
  type TendenciaKPI,
  type DatoSparkline
} from './KPICardAnimated'
