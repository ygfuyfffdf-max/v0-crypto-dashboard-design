/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS TABLES — SISTEMA DE TABLAS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas del sistema de tablas TanStack Table:
 * - QuantumTable: Tabla base reutilizable
 * - TablaVentas: Gestión de ventas con trazabilidad
 * - TablaOC: Órdenes de compra con métricas de lote
 * - TablaMovimientos: Movimientos bancarios
 * - TablaGastosAbonos: Gestión de gastos y abonos
 * - TablaStockHistorico: Historial de entradas/salidas
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// Base table component
export { QuantumTable, type QuantumTableProps } from './QuantumTable'

// Domain-specific tables
export { TablaGastosAbonos } from './TablaGastosAbonos'
export { TablaMovimientos } from './TablaMovimientos'
export { TablaOC } from './TablaOC'
export { TablaStockHistorico } from './TablaStockHistorico'
export { TablaVentas } from './TablaVentas'
