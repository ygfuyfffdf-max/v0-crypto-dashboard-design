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

// 🆕 HOOKS DE AUDITORÍA Y NOTIFICACIONES SUPREME (v3.0)
export {
  useAudit,
  useNotifications,
  useExport,
  useAuditedOperation
} from './useAuditNotifications'

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

// ═══════════════════════════════════════════════════════════════
// ADVANCED SCROLL SYSTEM (iOS-Style)
// ═══════════════════════════════════════════════════════════════
export {
  useAdvancedScroll,
  useSimpleScroll,
  useFormScroll,
  useInfiniteListScroll,
  usePullToRefreshScroll,
  type AdvancedScrollConfig,
  type ScrollState,
  type UseAdvancedScrollReturn,
} from './useAdvancedScroll'

// ═══════════════════════════════════════════════════════════════
// MOTION PREFERENCES (Accessibility & Performance)
// ═══════════════════════════════════════════════════════════════
export {
  useMotionPreferences,
  useMotionPreferencesStandalone,
  useReducedMotion,
  useIsMobile,
  MotionPreferencesProvider,
  getAnimationConfig,
  type MotionPreferences,
  type MotionPreferencesActions,
  type UseMotionPreferencesReturn,
} from './useMotionPreferences'

// ═══════════════════════════════════════════════════════════════════════════
// iOS TOAST HOOK (Sonner compatibility)
// ═══════════════════════════════════════════════════════════════════════════
export { useIOSToast, iosToast } from './useIOSToast'

// ═══════════════════════════════════════════════════════════════════════════
// 🆕 ADVANCED UX HOOKS (v3.0 - Ultra Premium)
// ═══════════════════════════════════════════════════════════════════════════
export {
  // Debounce/Throttle
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  
  // Optimistic Updates
  useOptimistic,
  
  // Intersection Observer
  useIntersectionObserver,
  
  // Media Queries
  useMediaQuery,
  useIsMobile as useIsMobileAdvanced,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  
  // Storage
  useLocalStorage,
  
  // Keyboard
  useKeyboardShortcut,
  
  // Clipboard
  useClipboard,
  
  // Online Status
  useOnlineStatus,
  
  // Scroll Position
  useScrollPosition,
  
  // Window Size
  useWindowSize,
  
  // Utilities
  usePrevious,
  useToggle,
  useInterval,
  useTimeout,
  useAsync,
} from './useAdvancedUX'
