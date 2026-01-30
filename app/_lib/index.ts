/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🏛️ CHRONOS INFINITY 2030 — ÍNDICE PRINCIPAL DE BIBLIOTECAS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Punto de entrada centralizado para todas las bibliotecas y sistemas del proyecto.
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// CORE SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════════════════

export * from './core'

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Presets
  springPresets,
  easingPresets,
  
  // Variants
  fadeVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  popVariants,
  modalVariants,
  listItemVariants,
  cardVariants,
  containerVariants,
  gridContainerVariants,
  
  // Utilities
  withDelay,
  forProperties,
  combineTransitions,
  getInteractiveMotionProps,
  getEntranceProps,
  
  // Hooks
  useAccessibleAnimation,
  useAccessibleVariants,
  useHoverAnimation,
  useStaggerAnimation,
  usePageTransition,
  
  // Config
  defaultLayoutConfig,
  defaultPresenceProps,
  
  // Types
  type AnimationConfig,
  type AnimationPreset,
} from './animations/FluidAnimations'

// ═══════════════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Validators
  validators,
  
  // Schemas
  BancoIdSchema,
  ClienteSchema,
  DistribuidorSchema,
  VentaSchema,
  OrdenCompraSchema,
  TransferenciaSchema,
  GastoSchema,
  AbonoVentaSchema,
  AbonoOrdenSchema,
  SearchFiltersSchema,
  UserPreferencesSchema,
  
  // Utilities
  validateAsync,
  validateSync,
  extractErrors,
  validateField,
  createPartialSchema,
  mergeSchemas,
  
  // Transformers
  stringToNumber,
  stringToDate,
  normalizedString,
  capitalizedString,
  
  // Types
  type ClienteInput,
  type DistribuidorInput,
  type VentaInput,
  type OrdenCompraInput,
  type TransferenciaInput,
  type GastoInput,
  type AbonoVentaInput,
  type AbonoOrdenInput,
  type SearchFilters,
  type UserPreferences,
  type BancoIdType,
  
  // Re-export zod
  z,
  type ZodError,
  type ZodSchema,
} from './validation/ValidationSchemas'

// ═══════════════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Classes
  ReportBuilder,
  
  // Functions
  createReport,
  getDateRangeValues,
  formatCellValue,
  calculateAggregation,
  exportToCSV,
  exportToJSON,
  
  // Templates
  REPORT_TEMPLATES,
  
  // Formatters
  formatters,
  
  // Types
  type ReportType,
  type ExportFormat,
  type DateRange,
  type ReportFilters,
  type ReportColumn,
  type ReportConfig,
  type ReportResult,
} from './reports/ReportSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════
// BATCH OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Functions
  executeBatch,
  parallelLimit,
  withRetry,
  
  // Classes
  BatchBuilder,
  
  // Factory
  createBatch,
  
  // Types
  type BatchOperation,
  type BatchOperationResult,
  type BatchResult,
  type BatchConfig,
} from './batch/BatchOperations'

// ═══════════════════════════════════════════════════════════════════════════════════════
// FORMS
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Hooks
  useForm,
  useFormContext,
  
  // Components
  FormProvider,
  Form,
  FormField,
  FormSubmit,
  FormStatus,
  
  // Schemas
  validationSchemas,
  
  // Types
  type FieldValue,
  type FieldState,
  type FormState,
  type UseFormOptions,
} from './forms/FormSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Provider
  ToastProvider,
  
  // Hook
  useToast,
  
  // Standalone
  toast,
  setGlobalToastRef,
  
  // Types
  type Toast,
  type ToastOptions,
  type ToastVariant,
  type ToastPosition,
  type ToastAction,
} from './notifications/ToastSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════
// LAZY LOADING
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Components
  Skeleton,
  CardSkeleton,
  MetricCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  FormSkeleton,
  ListSkeleton,
  LazyLoad,
  LazyErrorBoundary,
  DefaultErrorFallback,
  
  // Factory
  createLazyComponent,
  createLazyPanel,
  
  // Utilities
  prefetchComponent,
  
  // Types
  type LazyComponentOptions,
  type LazyLoadOptions,
} from './lazy/LazyLoadingSystem'
