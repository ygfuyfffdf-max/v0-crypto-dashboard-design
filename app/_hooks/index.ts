// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2030 - HOOKS INDEX
// Todos los hooks de datos usando Turso/Drizzle + Zustand
// ═══════════════════════════════════════════════════════════════

// Hook principal para queries genéricos
export { useDB, useRealtime } from './useDB'

// Hooks específicos por entidad
export { useBancos, useBancosData, useBancoData } from './useBancos'
export { useVentas, useVentasData, type VentaConCliente } from './useVentas'
export { useClientes, useClientesData } from './useClientes'
export { useDistribuidores, useDistribuidoresData } from './useDistribuidores'
export {
  useMovimientos,
  useMovimientosData,
  useIngresosBanco,
  useGastos,
  useTransferencias,
  useCorteBancario,
} from './useMovimientos'
export {
  useOrdenes,
  useOrdenesCompra,
  useOrdenesCompraData,
  type OrdenConDistribuidor,
} from './useOrdenes'
export {
  useAlmacen,
  useAlmacenData,
  useProductos,
  useEntradasAlmacen,
  useSalidasAlmacen,
} from './useAlmacen'

// Hook para datos combinados del sistema
export { useSystemData } from './useSystemData'

// IA Colaborativa
export { useVoiceRecognition, useTextToSpeech, useIAColaborativa } from './useIAColaborativa'

// Métricas CFO
export {
  useMetricasRapidas,
  useCapitalTotal,
  useSaludFinanciera,
  useROCE,
  useLiquidezDias,
  useDistribucionGYA,
} from './useMetricasRapidas'

// Realtime Hooks (NEW)
export {
  useRealtime as useRealtimeBase,
  useRealtimeBancos,
  useRealtimeVentas,
  useRealtimeClientes,
  useRealtimeDistribuidores,
  useRealtimeOrdenes,
  useRealtimeMovimientos,
  useRealtimeSystem,
} from './useRealtime'

// Premium UX Hooks
export {
  useHapticFeedback,
  useHaptic,
  triggerHaptic,
  type HapticPattern,
  type HapticConfig,
} from './useHapticFeedback'

export {
  useParallaxScroll,
  useParallaxLayer,
  CINEMATIC_LAYERS,
  IMMERSIVE_LAYERS,
  type ParallaxLayerConfig,
  type ParallaxConfig,
} from './useParallaxScroll'

// Bio-Feedback (Webcam PPG Heart Rate Detection)
export { useBioFeedback } from './useBioFeedback'

// Wake Word Detection ("Hey Chronos")
export { useWakeWord } from './useWakeWord'
