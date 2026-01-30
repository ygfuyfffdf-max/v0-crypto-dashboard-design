/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS TABLES — SISTEMA DE TABLAS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas del sistema de tablas TanStack Table:
 * - QuantumTable: Tabla base reutilizable
 * - SupremeDataTable: Tabla avanzada con trazabilidad
 * - SupremeDataTableUltra: Tabla ultra premium con todas las funcionalidades
 * - TablaTransaccionesUltra: Tabla de transacciones con trazabilidad completa
 * - TablaVentas: Gestión de ventas con trazabilidad
 * - TablaOC: Órdenes de compra con métricas de lote
 * - TablaMovimientos: Movimientos bancarios
 * - TablaGastosAbonos: Gestión de gastos y abonos
 * - TablaStockHistorico: Historial de entradas/salidas
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// Base table component
export { QuantumTable, type QuantumTableProps } from './QuantumTable'

// Supreme tables with traceability
export { default as SupremeDataTable } from './SupremeDataTable'
export { default as SupremeDataTableUltra, type SupremeDataTableUltraProps, type ColumnaTabla, type FilaExpansible, type TrazabilidadInfo, type HistorialCambio, type AccionTabla } from './SupremeDataTableUltra'

// Ultra transactions table with complete traceability
export {
  TablaTransaccionesUltra,
  default as TablaTransaccionesUltraDefault,
  type TransaccionCompleta,
  type TrazabilidadCompleta,
  type DispositivoInfo,
  type UsuarioAudit,
  type CambioHistorial,
  type FiltrosTabla,
  type ColumnaConfig,
} from './TablaTransaccionesUltra'

// Domain-specific tables
export { TablaGastosAbonos } from './TablaGastosAbonos'
export { TablaMovimientos } from './TablaMovimientos'
export { TablaOC } from './TablaOC'
export { TablaStockHistorico } from './TablaStockHistorico'
export { TablaVentas } from './TablaVentas'
