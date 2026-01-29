import { relations } from 'drizzle-orm/relations'
import {
  distribuidores,
  almacen,
  usuarios,
  movimientos,
  ordenesCompra,
  ventas,
  clientes,
  bancos,
  abonos,
  entradaAlmacen,
  pagosDistribuidor,
  salidaAlmacen,
  alertas,
  auditLog,
  conciliaciones,
  devoluciones,
} from './schema'

export const almacenRelations = relations(almacen, ({ one, many }) => ({
  distribuidore: one(distribuidores, {
    fields: [almacen.distribuidorPrincipalId],
    references: [distribuidores.id],
  }),
  ordenesCompras: many(ordenesCompra),
  ventas: many(ventas),
  entradaAlmacens: many(entradaAlmacen),
  salidaAlmacens: many(salidaAlmacen),
}))

export const distribuidoresRelations = relations(distribuidores, ({ many }) => ({
  almacens: many(almacen),
  movimientos: many(movimientos),
  ordenesCompras: many(ordenesCompra),
  pagosDistribuidors: many(pagosDistribuidor),
}))

export const movimientosRelations = relations(movimientos, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [movimientos.createdBy],
    references: [usuarios.id],
  }),
  ordenesCompra: one(ordenesCompra, {
    fields: [movimientos.ordenCompraId],
    references: [ordenesCompra.id],
  }),
  venta: one(ventas, {
    fields: [movimientos.ventaId],
    references: [ventas.id],
  }),
  distribuidore: one(distribuidores, {
    fields: [movimientos.distribuidorId],
    references: [distribuidores.id],
  }),
  cliente: one(clientes, {
    fields: [movimientos.clienteId],
    references: [clientes.id],
  }),
  banco_bancoDestinoId: one(bancos, {
    fields: [movimientos.bancoDestinoId],
    references: [bancos.id],
    relationName: 'movimientos_bancoDestinoId_bancos_id',
  }),
  banco_bancoOrigenId: one(bancos, {
    fields: [movimientos.bancoOrigenId],
    references: [bancos.id],
    relationName: 'movimientos_bancoOrigenId_bancos_id',
  }),
  banco_bancoId: one(bancos, {
    fields: [movimientos.bancoId],
    references: [bancos.id],
    relationName: 'movimientos_bancoId_bancos_id',
  }),
}))

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  movimientos: many(movimientos),
  ordenesCompras: many(ordenesCompra),
  ventas: many(ventas),
  abonos: many(abonos),
  pagosDistribuidors: many(pagosDistribuidor),
  alertas: many(alertas),
  auditLogs: many(auditLog),
  conciliaciones: many(conciliaciones),
  devoluciones_createdBy: many(devoluciones, {
    relationName: 'devoluciones_createdBy_usuarios_id',
  }),
  devoluciones_procesadoPor: many(devoluciones, {
    relationName: 'devoluciones_procesadoPor_usuarios_id',
  }),
  devoluciones_aprobadoPor: many(devoluciones, {
    relationName: 'devoluciones_aprobadoPor_usuarios_id',
  }),
}))

export const ordenesCompraRelations = relations(ordenesCompra, ({ one, many }) => ({
  movimientos: many(movimientos),
  usuario: one(usuarios, {
    fields: [ordenesCompra.createdBy],
    references: [usuarios.id],
  }),
  banco: one(bancos, {
    fields: [ordenesCompra.bancoOrigenId],
    references: [bancos.id],
  }),
  distribuidore: one(distribuidores, {
    fields: [ordenesCompra.distribuidorId],
    references: [distribuidores.id],
  }),
  almacen: one(almacen, {
    fields: [ordenesCompra.productoId],
    references: [almacen.id],
  }),
  ventas: many(ventas),
  entradaAlmacens: many(entradaAlmacen),
  pagosDistribuidors: many(pagosDistribuidor),
  devoluciones: many(devoluciones),
}))

export const ventasRelations = relations(ventas, ({ one, many }) => ({
  movimientos: many(movimientos),
  usuario: one(usuarios, {
    fields: [ventas.createdBy],
    references: [usuarios.id],
  }),
  cliente: one(clientes, {
    fields: [ventas.clienteId],
    references: [clientes.id],
  }),
  ordenesCompra: one(ordenesCompra, {
    fields: [ventas.ocId],
    references: [ordenesCompra.id],
  }),
  almacen: one(almacen, {
    fields: [ventas.productoId],
    references: [almacen.id],
  }),
  banco: one(bancos, {
    fields: [ventas.bancoDestino],
    references: [bancos.id],
  }),
  abonos: many(abonos),
  salidaAlmacens: many(salidaAlmacen),
  devoluciones: many(devoluciones),
}))

export const clientesRelations = relations(clientes, ({ many }) => ({
  movimientos: many(movimientos),
  ventas: many(ventas),
  abonos: many(abonos),
  devoluciones: many(devoluciones),
}))

export const bancosRelations = relations(bancos, ({ many }) => ({
  movimientos_bancoDestinoId: many(movimientos, {
    relationName: 'movimientos_bancoDestinoId_bancos_id',
  }),
  movimientos_bancoOrigenId: many(movimientos, {
    relationName: 'movimientos_bancoOrigenId_bancos_id',
  }),
  movimientos_bancoId: many(movimientos, {
    relationName: 'movimientos_bancoId_bancos_id',
  }),
  ordenesCompras: many(ordenesCompra),
  ventas: many(ventas),
  pagosDistribuidors: many(pagosDistribuidor),
  conciliaciones: many(conciliaciones),
  devoluciones: many(devoluciones),
}))

export const abonosRelations = relations(abonos, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [abonos.createdBy],
    references: [usuarios.id],
  }),
  cliente: one(clientes, {
    fields: [abonos.clienteId],
    references: [clientes.id],
  }),
  venta: one(ventas, {
    fields: [abonos.ventaId],
    references: [ventas.id],
  }),
}))

export const entradaAlmacenRelations = relations(entradaAlmacen, ({ one }) => ({
  almacen: one(almacen, {
    fields: [entradaAlmacen.productoId],
    references: [almacen.id],
  }),
  ordenesCompra: one(ordenesCompra, {
    fields: [entradaAlmacen.ordenCompraId],
    references: [ordenesCompra.id],
  }),
}))

export const pagosDistribuidorRelations = relations(pagosDistribuidor, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [pagosDistribuidor.createdBy],
    references: [usuarios.id],
  }),
  banco: one(bancos, {
    fields: [pagosDistribuidor.bancoOrigenId],
    references: [bancos.id],
  }),
  distribuidore: one(distribuidores, {
    fields: [pagosDistribuidor.distribuidorId],
    references: [distribuidores.id],
  }),
  ordenesCompra: one(ordenesCompra, {
    fields: [pagosDistribuidor.ordenCompraId],
    references: [ordenesCompra.id],
  }),
}))

export const salidaAlmacenRelations = relations(salidaAlmacen, ({ one }) => ({
  almacen: one(almacen, {
    fields: [salidaAlmacen.productoId],
    references: [almacen.id],
  }),
  venta: one(ventas, {
    fields: [salidaAlmacen.ventaId],
    references: [ventas.id],
  }),
}))

export const alertasRelations = relations(alertas, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [alertas.resueltaPor],
    references: [usuarios.id],
  }),
}))

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [auditLog.userId],
    references: [usuarios.id],
  }),
}))

export const conciliacionesRelations = relations(conciliaciones, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [conciliaciones.conciliadoPor],
    references: [usuarios.id],
  }),
  banco: one(bancos, {
    fields: [conciliaciones.bancoId],
    references: [bancos.id],
  }),
}))

export const devolucionesRelations = relations(devoluciones, ({ one }) => ({
  usuario_createdBy: one(usuarios, {
    fields: [devoluciones.createdBy],
    references: [usuarios.id],
    relationName: 'devoluciones_createdBy_usuarios_id',
  }),
  usuario_procesadoPor: one(usuarios, {
    fields: [devoluciones.procesadoPor],
    references: [usuarios.id],
    relationName: 'devoluciones_procesadoPor_usuarios_id',
  }),
  usuario_aprobadoPor: one(usuarios, {
    fields: [devoluciones.aprobadoPor],
    references: [usuarios.id],
    relationName: 'devoluciones_aprobadoPor_usuarios_id',
  }),
  ordenesCompra: one(ordenesCompra, {
    fields: [devoluciones.ocDestinoId],
    references: [ordenesCompra.id],
  }),
  banco: one(bancos, {
    fields: [devoluciones.bancoReembolso],
    references: [bancos.id],
  }),
  cliente: one(clientes, {
    fields: [devoluciones.clienteId],
    references: [clientes.id],
  }),
  venta: one(ventas, {
    fields: [devoluciones.ventaId],
    references: [ventas.id],
  }),
}))
