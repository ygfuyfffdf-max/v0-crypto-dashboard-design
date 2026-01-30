/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🏛️ CHRONOS INFINITY 2030 — CORE ENGINE EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas del motor FlowDistributor
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// FlowDistributor Engine
export {
  // Tipos
  type BancoId,
  type Moneda,
  type EstadoPago,
  type TipoMovimiento,
  type Banco,
  type Distribuidor,
  type OrdenCompra,
  type Cliente,
  type Venta,
  type MovimientoBanco,
  type MovimientoAlmacen,
  type Almacen,
  type EstadisticasVentas,
  type EstadisticasRentabilidad,

  // Funciones
  calcularDistribucionVenta,
  calcularDistribucionSegunPago,
  calcularCapitalBanco,
  procesarTransferencia,
  procesarGasto,
  procesarIngreso,
  procesarEntradaAlmacen,
  procesarSalidaAlmacen,
  calcularEstadisticasRentabilidad,
  predecirVentas,
  validarOrdenCompra,
  validarVenta,

  // Constantes
  FLETE_DEFAULT_USD,
  BANCOS_RECIBEN_VENTAS,
  BANCOS_OPERATIVOS,
  BANCO_CONFIG,

  // Engine
  FlowDistributorEngine,
} from './FlowDistributorEngine'

// Casa de Cambio Engine
export {
  // Tipos
  type TipoOperacionFX,
  type OperacionCambio,
  type TipoCambioActual,
  type InventarioUSD,
  type EstadisticasCasaCambio,
  type ProyeccionRentabilidad,

  // Funciones
  calcularTiposCambio,
  procesarCompraUSD,
  procesarVentaUSD,
  calcularInventarioUSD,
  calcularEstadisticasCasaCambio,
  proyectarRentabilidad,
  sugerirPrecioVenta,

  // Constantes
  SPREAD_MINIMO,
  SPREAD_RECOMENDADO,
  SPREAD_MAXIMO,
  TC_REFERENCIA_DEFAULT,

  // Engine
  CasaCambioEngine,
} from './CasaCambioEngine'

// Store
export {
  useFlowDistributorStore,
  selectBanco,
  selectTotalCapital,
  selectDeudaClientes,
  selectAdeudoDistribuidores,
  selectVentasPendientes,
  selectMovimientosBanco,
} from './FlowDistributorStore'

// ═══════════════════════════════════════════════════════════════════════════════════════
// ULTRA CACHE SYSTEM — Sistema de caché multinivel
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  ultraCache,
  createCachedFetcher,
  cached,
  withCache,
  type CacheOptions,
  type CacheStats,
} from './UltraCacheSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════
// OPTIMIZED SELECTORS — Selectores memoizados para Zustand
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Utility selectors
  createMemoizedSelector,
  combineSelectors,
  createShallowSelector,
  createTransformedSelector,
  createKPIsSelector,
  createPerformanceSelector,
  shallow,
  deepEqual,
  arrayShallow,
  type PerformanceMetrics as SelectorPerformanceMetrics,
} from './OptimizedSelectors'

// ═══════════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE MONITOR — Monitoreo de rendimiento en tiempo real
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  performanceMonitor,
  usePerformanceMetrics,
  usePerformanceEvents,
  useRenderTime,
  useMeasuredEffect,
  useMeasuredCallback,
  type PerformanceMetrics as PerfMetrics,
  type PerformanceEvent,
  type PerformanceThresholds,
} from './PerformanceMonitor'

// ═══════════════════════════════════════════════════════════════════════════════════════
// FLOW ENGINE — Motor de flujos operacionales con transacciones
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  FlowBuilder,
  createFlow,
  createStep,
  ventaFlowTemplate,
  ordenCompraFlowTemplate,
  transferenciaFlowTemplate,
  type FlowStep,
  type FlowResult,
  type StepResult,
  type FlowConfig,
  type StepStatus,
  type VentaInput,
  type OrdenCompraInput,
  type TransferenciaInput,
} from './FlowEngine'
