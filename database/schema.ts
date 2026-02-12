/**
 * CHRONOS INFINITY 2026 - Database Schema
 * Re-exports the Drizzle schema with TypeScript type inferrence
 *
 * This is the canonical schema import point: import { ... } from '@/database/schema'
 */

// Re-export all tables from drizzle schema
export {
  almacen,
  bancos,
  clientes,
  distribuidores,
  movimientos,
  ordenesCompra,
  usuarios,
  ventas,
  abonos,
  aiChatMessages,
  aiChatSessions,
  entradaAlmacen,
  kpisGlobales,
  pagosDistribuidor,
  salidaAlmacen,
  alertas,
  alertasConfig,
  auditLog,
  conciliaciones,
  devoluciones,
} from '../drizzle/schema'

// Re-import for type inference
import {
  almacen,
  bancos,
  clientes,
  distribuidores,
  movimientos,
  ordenesCompra,
  usuarios,
  ventas,
  abonos,
  aiChatMessages,
  aiChatSessions,
  entradaAlmacen,
  kpisGlobales,
  pagosDistribuidor,
  salidaAlmacen,
  alertas,
  alertasConfig,
  auditLog,
  conciliaciones,
  devoluciones,
} from '../drizzle/schema'

// ═══════════════════════════════════════════════════════════════════════════
// TypeScript Types - Inferred from schema
// ═══════════════════════════════════════════════════════════════════════════

// Almacen (Productos/Inventario)
export type Almacen = typeof almacen.$inferSelect
export type InsertAlmacen = typeof almacen.$inferInsert

// Bancos
export type Banco = typeof bancos.$inferSelect
export type InsertBanco = typeof bancos.$inferInsert

// Clientes
export type Cliente = typeof clientes.$inferSelect
export type InsertCliente = typeof clientes.$inferInsert

// Distribuidores
export type Distribuidor = typeof distribuidores.$inferSelect
export type InsertDistribuidor = typeof distribuidores.$inferInsert

// Movimientos
export type Movimiento = typeof movimientos.$inferSelect
export type InsertMovimiento = typeof movimientos.$inferInsert

// Ordenes de Compra
export type OrdenCompra = typeof ordenesCompra.$inferSelect
export type InsertOrdenCompra = typeof ordenesCompra.$inferInsert

// Usuarios
export type Usuario = typeof usuarios.$inferSelect
export type InsertUsuario = typeof usuarios.$inferInsert

// Ventas
export type Venta = typeof ventas.$inferSelect
export type InsertVenta = typeof ventas.$inferInsert

// Abonos
export type Abono = typeof abonos.$inferSelect
export type InsertAbono = typeof abonos.$inferInsert

// AI Chat
export type AiChatMessage = typeof aiChatMessages.$inferSelect
export type InsertAiChatMessage = typeof aiChatMessages.$inferInsert
export type AiChatSession = typeof aiChatSessions.$inferSelect
export type InsertAiChatSession = typeof aiChatSessions.$inferInsert

// Entradas/Salidas Almacen
export type EntradaAlmacen = typeof entradaAlmacen.$inferSelect
export type InsertEntradaAlmacen = typeof entradaAlmacen.$inferInsert
export type SalidaAlmacen = typeof salidaAlmacen.$inferSelect
export type InsertSalidaAlmacen = typeof salidaAlmacen.$inferInsert

// KPIs
export type KpiGlobal = typeof kpisGlobales.$inferSelect
export type InsertKpiGlobal = typeof kpisGlobales.$inferInsert

// Pagos Distribuidor
export type PagoDistribuidor = typeof pagosDistribuidor.$inferSelect
export type InsertPagoDistribuidor = typeof pagosDistribuidor.$inferInsert

// Alertas
export type Alerta = typeof alertas.$inferSelect
export type InsertAlerta = typeof alertas.$inferInsert
export type AlertaConfig = typeof alertasConfig.$inferSelect
export type InsertAlertaConfig = typeof alertasConfig.$inferInsert

// Audit Log
export type AuditLogEntry = typeof auditLog.$inferSelect
export type InsertAuditLogEntry = typeof auditLog.$inferInsert

// Conciliaciones
export type Conciliacion = typeof conciliaciones.$inferSelect
export type InsertConciliacion = typeof conciliaciones.$inferInsert

// Devoluciones
export type Devolucion = typeof devoluciones.$inferSelect
export type InsertDevolucion = typeof devoluciones.$inferInsert

// Alias for backwards compatibility
export const productos = almacen
export type Producto = Almacen
export type InsertProducto = InsertAlmacen
