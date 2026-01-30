/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎨 CHRONOS INFINITY 2030 — ÍNDICE DE COMPONENTES PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Exportaciones centralizadas de todos los componentes premium del sistema.
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Buttons
  Button,
  
  // Inputs
  Input,
  Select,
  
  // Cards
  Card,
  
  // Badges
  Badge,
  
  // Metrics
  MetricCard,
  
  // Loading
  LoadingSpinner,
  
  // Tokens
  tokens,
  designTokens,
  
  // Types
  type ButtonVariant,
  type ButtonSize,
} from './ui/SupremeComponents'

// ═══════════════════════════════════════════════════════════════════════════════════════
// DATA VISUALIZATION
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Numbers
  AnimatedNumber,
  
  // Charts
  Sparkline,
  MiniBarChart,
  
  // Progress
  ProgressBar,
  CircularProgress,
  
  // Comparisons
  StatComparison,
  
  // Indicators
  TrendIndicator,
  KPICard,
  
  // Types
  type AnimatedNumberProps,
  type KPICardProps,
  type SparklineProps,
  type ProgressBarProps,
  type CircularProgressProps,
  type StatComparisonProps,
  type MiniBarChartProps,
  type TrendIndicatorProps,
} from './visualizations/DataVisualization'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TABLES
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  DataTable,
  type Column,
  type SortConfig,
  type FilterConfig,
  type PaginationConfig,
} from './tables/DataTablePremium'

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODALS & DIALOGS
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Provider
  ModalStackProvider,
  
  // Modal
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  
  // Drawer
  Drawer,
  
  // Dialog
  ConfirmDialog,
  
  // Hooks
  useModal,
  useConfirmDialog,
  
  // Types
  type ModalSize,
  type ModalPosition,
  type DrawerPosition,
  type ModalProps,
  type DrawerProps,
  type ConfirmDialogProps,
} from './modals/ModalSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMMAND PALETTE
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
  // Provider
  CommandPaletteProvider,
  
  // Hook
  useCommandPalette,
  useDefaultCommands,
  
  // Types
  type Command,
  type CommandCategory,
} from './command/CommandPalette'

// ═══════════════════════════════════════════════════════════════════════════════════════
// RE-EXPORTS FROM CHRONOS-2026
// ═══════════════════════════════════════════════════════════════════════════════════════

// Panels and layouts are re-exported from their original locations
// to maintain backward compatibility
