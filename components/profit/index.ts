/**
 * Profit Module - Exportaciones principales
 * 
 * Módulo completo para el sistema de arbitraje "Panel Profit"
 */

// Componentes principales
export { ProfitCommandCenter } from './ProfitCommandCenter';
export { ArbitrageGauge } from './ArbitrageGauge';
export { HoldCalculator } from './HoldCalculator';
export { TrendForecastChart } from './TrendForecastChart';

// Re-exportar tipos
export type {
  MarketLiveFeed,
  TreasuryPosition,
  ArbitrageOpportunity,
  StrategyMode,
  TreasuryAlert,
  TreasuryHealthMetrics,
} from '@/lib/profit-engine/types/profit-engine.types';
